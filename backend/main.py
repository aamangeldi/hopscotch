from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI
import httpx
import random
import logging

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware to allow React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("Hopscotch API Starting...")
    logger.info(f"OpenAI API Key: {'Set' if OPENAI_API_KEY else 'Missing'}")
    logger.info(f"Pexels API Key: {'Set' if PEXELS_API_KEY else 'Missing'}")
    logger.info("=" * 60)


async def fetch_image_from_pexels(search_term: str) -> str:
    """
    Fetch a high-quality image URL from Pexels based on search term.
    Returns the most relevant image for the given search term.
    """
    if not PEXELS_API_KEY:
        logger.error("PEXELS_API_KEY not found in environment variables")
        raise ValueError("PEXELS_API_KEY is required. Get your free API key at https://www.pexels.com/api/")

    logger.info(f"Fetching image from Pexels for: '{search_term}'")

    async with httpx.AsyncClient() as http_client:
        response = await http_client.get(
            "https://api.pexels.com/v1/search",
            headers={"Authorization": PEXELS_API_KEY},
            params={
                "query": search_term,
                "per_page": 5,  # Get top 5 most relevant results
                "orientation": "landscape"
            },
            timeout=10.0
        )

        if response.status_code == 200:
            data = response.json()
            photos = data.get("photos", [])
            if photos:
                # Use the first (most relevant) photo instead of random
                photo = photos[0]
                image_url = photo["src"]["large"]
                logger.info(f"Found image for '{search_term}': {photo['photographer']} - {image_url[:50]}...")
                return image_url
            else:
                # No photos found for this search term
                logger.warning(f"No images found on Pexels for: '{search_term}'")
                raise HTTPException(
                    status_code=404,
                    detail=f"No images found for '{search_term}' on Pexels"
                )
        else:
            logger.error(f"Pexels API error (status {response.status_code}): {response.text[:200]}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Pexels API error: {response.text}"
            )


class SearchRequest(BaseModel):
    query: str
    context: Optional[List[dict]] = None  # Previous selections with similar/different


class RecommendationItem(BaseModel):
    title: str  # 2-5 words
    description: str  # Max 100 characters
    image_search_term: str  # 2-4 words
    url: str


class RecommendationsOutput(BaseModel):
    recommendations: List[RecommendationItem]


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
    logger.info(f"Search request received - Query: '{request.query}'")
    if request.context:
        logger.info(f"Context: {len(request.context)} previous feedback items")
        for idx, ctx in enumerate(request.context):
            logger.info(f"  [{idx+1}] {ctx.get('feedback').upper()}: {ctx.get('title')}")

    try:
        # Build the prompt based on query and context
        system_prompt = """You are a creative recommendation engine. Generate 3 diverse, interesting recommendations
        based on the user's query. Each recommendation should be something visual and discoverable online
        (products, websites, concepts, places, activities, etc.).

        For each recommendation provide:
        - title: A catchy, short title (2-5 words)
        - description: A very concise description (MAX 100 characters, be brief!)
        - image_search_term: A VERY SPECIFIC 2-4 word visual search term that precisely represents this recommendation.
          Examples of GOOD search terms:
          * "japanese ramen bowl close up"
          * "northern lights over mountains"
          * "minimalist scandinavian interior"
          * "golden retriever puppy playing"

          Examples of BAD (too generic) search terms:
          * "food" (too vague)
          * "nature" (too broad)
          * "design" (not specific enough)

        - url: A real, working website URL directly related to the item (use actual domains: wikipedia.org, brand sites, specific product pages, etc.)

        CRITICAL: Each image_search_term must be:
        1. Highly specific and visual (not abstract concepts)
        2. Different from the other two results
        3. Likely to return a clear, recognizable photo on an image search

        Make the recommendations diverse and interesting. Prioritize things with strong visual identity."""

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

        # Call OpenAI API with structured outputs
        logger.info(f"Calling OpenAI API (gpt-4o-mini) with query: '{request.query}'")
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            response_format=RecommendationsOutput
        )

        # Get structured output
        output = completion.choices[0].message.parsed
        logger.info(f"OpenAI API response received - tokens used: {completion.usage.total_tokens}")
        logger.info(f"Received {len(output.recommendations)} structured recommendations")

        # Extract results from structured output
        results = [rec.model_dump() for rec in output.recommendations]

        # Convert image_search_term to actual image URLs from Pexels
        import asyncio

        logger.info(f"Generated {len(results)} recommendations:")
        for idx, result in enumerate(results[:3]):
            logger.info(f"  [{idx+1}] {result.get('title')} - search term: '{result.get('image_search_term')}'")

        processed_results = []

        # Fetch images concurrently for all results
        logger.info("Fetching images from Pexels API...")
        image_tasks = []
        for result in results[:3]:
            search_term = result.get("image_search_term", "abstract")
            image_tasks.append(fetch_image_from_pexels(search_term))

        # Wait for all image fetches to complete
        image_urls = await asyncio.gather(*image_tasks)

        # Combine results with fetched images
        for idx, result in enumerate(results[:3]):
            result["image_url"] = image_urls[idx]
            # Remove image_search_term from final output
            result.pop("image_search_term", None)
            processed_results.append(result)

        # Validate we have exactly 3 results
        while len(processed_results) < 3:
            fallback_image = await fetch_image_from_pexels("abstract")
            processed_results.append({
                "title": "Explore More",
                "description": "Try a different search",
                "image_url": fallback_image,
                "url": "https://google.com"
            })

        logger.info(f"Search completed successfully - Returning {len(processed_results)} results")
        return SearchResponse(results=processed_results[:3])

    except Exception as e:
        logger.error(f"Error in search endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating results: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
