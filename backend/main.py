from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from openai import OpenAI
import httpx
import logging
import asyncio

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Common prompt components
PROMPT_BASE_INSTRUCTION = "You are a creative recommendation engine."

PROMPT_OUTPUT_FORMAT = """For each recommendation provide:
- title: A catchy, short title (2-5 words)
- description: A very concise description (MAX 100 characters, be brief!)
- image_search_term: A VERY SPECIFIC 2-4 word visual search term that precisely represents this recommendation.
- url: A real, working website URL directly related to the item"""

PROMPT_IMAGE_GUIDANCE = """
Examples of GOOD search terms:
* "japanese ramen bowl close up"
* "northern lights over mountains"
* "minimalist scandinavian interior"
* "golden retriever puppy playing"

Examples of BAD (too generic) search terms:
* "food" (too vague)
* "nature" (too broad)
* "design" (not specific enough)

CRITICAL: Each image_search_term must be:
1. Highly specific and visual (not abstract concepts)
2. Different from the other results
3. Likely to return a clear, recognizable photo on an image search"""

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


async def process_results_with_images(results: List[dict]) -> List[dict]:
    """
    Fetch images for results and process them into the final format.
    Removes image_search_term and adds image_url.
    """
    logger.info(f"Fetching {len(results)} image(s) from Pexels API...")

    # Fetch images concurrently
    image_tasks = [
        fetch_image_from_pexels(result.get("image_search_term", "abstract"))
        for result in results
    ]
    image_urls = await asyncio.gather(*image_tasks)

    # Combine results with fetched images
    processed_results = []
    for idx, result in enumerate(results):
        result["image_url"] = image_urls[idx]
        result.pop("image_search_term", None)
        processed_results.append(result)

    return processed_results


class SearchRequest(BaseModel):
    query: str


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


class RefineRequest(BaseModel):
    feedback: str  # "similar" or "different"
    clickedResult: ResultItem
    allResults: List[ResultItem]
    resultIndex: int


class RefineResponse(BaseModel):
    results: List[ResultItem]


@app.get("/")
async def root():
    return {"message": "Hopscotch API"}


@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Generate 3 diverse visual results based on user query.
    """
    logger.info(f"Search request received - Query: '{request.query}'")

    try:
        # Build the prompt using common components
        system_prompt = f"""{PROMPT_BASE_INSTRUCTION} Generate 3 diverse, interesting recommendations
based on the user's query. Each recommendation should be something visual and discoverable online
(products, websites, concepts, places, activities, etc.).

{PROMPT_OUTPUT_FORMAT}
{PROMPT_IMAGE_GUIDANCE}

Make the recommendations diverse and interesting. Prioritize things with strong visual identity."""

        user_prompt = f"Query: {request.query}"

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

        logger.info(f"Generated {len(results)} recommendations:")
        for idx, result in enumerate(results[:3]):
            logger.info(f"  [{idx+1}] {result.get('title')} - search term: '{result.get('image_search_term')}'")

        # Fetch images and process results
        processed_results = await process_results_with_images(results[:3])

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


@app.post("/api/refine", response_model=RefineResponse)
async def refine(request: RefineRequest):
    """
    Refine results based on user feedback (similar or different).
    - For "similar": Generate 2 new results similar to the clicked result
    - For "different": Generate 1 new result different from the clicked result, more aligned with the other 2
    """
    logger.info(f"Refine request received - Feedback: '{request.feedback}' on '{request.clickedResult.title}'")

    try:
        # Determine how many results to generate
        num_results = 2 if request.feedback == "similar" else 1

        # Build prompts using common components
        if request.feedback == "similar":
            # Generate 2 results similar to the clicked result
            system_prompt = f"""{PROMPT_BASE_INSTRUCTION} Generate recommendations that are
SIMILAR to the reference item provided. The recommendations should share common themes, style,
category, or characteristics with the reference.

{PROMPT_OUTPUT_FORMAT}

Make the recommendations diverse but clearly related to the reference item."""

            user_prompt = f"""Reference item (generate {num_results} items SIMILAR to this):
Title: {request.clickedResult.title}
Description: {request.clickedResult.description}

Generate {num_results} recommendations that are similar to this reference item."""

        else:  # "different"
            # Generate 1 result different from the clicked result, aligned with the other 2
            other_results = [r for i, r in enumerate(request.allResults) if i != request.resultIndex]

            system_prompt = f"""{PROMPT_BASE_INSTRUCTION} Generate a recommendation that is
DIFFERENT from the reference item but MORE ALIGNED with the direction suggested by the other items.

{PROMPT_OUTPUT_FORMAT}

The recommendation should contrast with the reference item but fit better with the other items."""

            user_prompt = f"""Reference item (generate something DIFFERENT from this):
Title: {request.clickedResult.title}
Description: {request.clickedResult.description}

Other items in the set (generate something more aligned with these):
1. Title: {other_results[0].title}
   Description: {other_results[0].description}
2. Title: {other_results[1].title}
   Description: {other_results[1].description}

Generate 1 recommendation that is different from the reference but more aligned with the other items."""

        # Call OpenAI API
        logger.info(f"Calling OpenAI API for {num_results} {'similar' if request.feedback == 'similar' else 'different'} result(s)")
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

        # Extract results and fetch images
        results = [rec.model_dump() for rec in output.recommendations[:num_results]]
        processed_results = await process_results_with_images(results)

        logger.info(f"Refine completed successfully - Returning {len(processed_results)} result(s)")
        return RefineResponse(results=processed_results)

    except Exception as e:
        logger.error(f"Error in refine endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error refining results: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
