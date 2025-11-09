from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI()

# CORS middleware to allow React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class SearchRequest(BaseModel):
    query: str
    context: Optional[List[dict]] = None  # Previous selections with similar/different


class ResultItem(BaseModel):
    title: str
    description: str
    image_url: str
    url: str


class SearchResponse(BaseModel):
    results: List[ResultItem]


@app.get("/")
async def root():
    return {"message": "Hopscotch API"}


@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Generate 3 visual results based on user query and context (similar/different feedback)
    """
    try:
        # Build the prompt based on query and context
        system_prompt = """You are a creative recommendation engine. Generate 3 diverse, interesting recommendations
        based on the user's query. Each recommendation should be something visual and discoverable online
        (products, websites, concepts, places, etc.).

        Return ONLY a valid JSON array with exactly 3 objects, each with:
        - title: A catchy, short title
        - description: 1-2 sentence description
        - image_search_term: A specific 1-3 word search term for finding an image for this item (e.g., "sushi platter", "mountain lake", "modern architecture")
        - url: A real website URL related to the item (actual domain like wikipedia.org, brand sites, etc.)

        IMPORTANT: Make each image_search_term specific and different to get diverse images.

        Make the recommendations diverse and interesting. Focus on things that have good visual representation."""

        user_prompt = f"Query: {request.query}"

        # Add context from previous selections
        if request.context:
            context_str = "\n\nUser feedback from previous selections:\n"
            for item in request.context:
                feedback = item.get("feedback")  # "similar" or "different"
                title = item.get("title")
                context_str += f"- {feedback.upper()} to: {title}\n"
            user_prompt += context_str
            user_prompt += "\nUse this feedback to refine the recommendations."

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            response_format={"type": "json_object"}
        )

        # Parse the response
        import json
        content = response.choices[0].message.content
        data = json.loads(content)

        # Handle both array and object with results key
        if isinstance(data, list):
            results = data
        elif "results" in data:
            results = data["results"]
        else:
            # Try to find any array in the response
            for value in data.values():
                if isinstance(value, list):
                    results = value
                    break
            else:
                results = []

        # Convert image_search_term to actual image URLs
        import random
        import time

        processed_results = []
        # Generate unique random IDs for each image
        random.seed(int(time.time() * 1000))

        for idx, result in enumerate(results[:3]):
            search_term = result.get("image_search_term", "abstract")
            # Use Lorem Picsum for truly random images
            # Generate a unique random image ID (picsum has IDs 0-1000+)
            random_id = random.randint(1, 1000)
            result["image_url"] = f"https://picsum.photos/seed/{search_term.replace(' ', '-')}-{random_id}/800/600"
            # Remove image_search_term from final output
            result.pop("image_search_term", None)
            processed_results.append(result)

        # Validate we have exactly 3 results
        while len(processed_results) < 3:
            random_id = random.randint(1, 1000)
            processed_results.append({
                "title": "Explore More",
                "description": "Try a different search",
                "image_url": f"https://picsum.photos/seed/explore-{random_id}/800/600",
                "url": "https://google.com"
            })

        return SearchResponse(results=processed_results[:3])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating results: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
