# Hopscotch - Visual Discovery Journey

A search interface where you hop through numbered boxes to discover visual content. Built with React and FastAPI, powered by OpenAI.

## Features

- Interactive hopscotch navigation - click numbered boxes to jump back
- AI-powered visual search results (images, products, websites)
- Refinement system - mark results as "similar" or "different" to guide next results
- Simple, minimal interface

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI (Python) + OpenAI API

## Setup

### Backend

1. Install `uv` if you haven't already:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys to `.env`:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   PEXELS_API_KEY=your_pexels_api_key_here
   ```

   **Getting API Keys:**
   - **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)
   - **Pexels** (required for images):
     1. Sign up at [pexels.com/api](https://www.pexels.com/api/)
     2. Generate a free API key (200 requests/hour)
     3. This is required to fetch relevant images for search results

5. Run the backend (uv will automatically create venv and install dependencies):
   ```bash
   uv run main.py
   ```

   The API will run on `http://localhost:8000`

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173`

## Usage

1. Click on box number 1 to start
2. Type what you're looking for and hit "hop"
3. View 3 visual results in box 2
4. For each result, choose:
   - "similar" - get more results like this
   - "different" - get results unlike this
   - Or try a different search
5. Click any numbered box in the trail at the top to jump back
6. Continue hopping through your discovery journey!

## Deployment to Render

Both frontend and backend are deployed to Render's free tier. Currently live at:
- https://hopscotch-frontend.onrender.com
- https://hopscotch-backend-9euv.onrender.com

### Backend Deployment Instructions

1. Go to [render.com](https://render.com) and sign up/login with GitHub

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository

4. Configure the service:
   - **Name**: `hopscotch-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install .`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

5. Add environment variables:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `PEXELS_API_KEY` - Your Pexels API key

6. Click **"Create Web Service"**

7. Copy your backend URL (e.g., `https://hopscotch-backend-xxxx.onrender.com`)

### Frontend Deployment Instructions (Static Site)

1. In Render dashboard, click **"New +"** → **"Static Site"**

2. Connect the same GitHub repository

3. Configure the site:
   - **Name**: `hopscotch-frontend` (or your choice)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install; npm run build`
   - **Publish Directory**: `dist`

4. Add environment variable:
   - `VITE_API_URL` - Your backend URL from step 7 above

5. Click **"Create Static Site"**

Your app will be live at the provided Render URL!

## Environment Variables for Production

### Frontend (Static Site)
- `VITE_API_URL` - Backend API URL (e.g., `https://hopscotch-backend-xxxx.onrender.com`)

### Backend (Web Service)
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PEXELS_API_KEY` - Your Pexels API key (required for images)

## Tech Stack

- **Frontend**
  - React 19
  - Vite 7
  - Tailwind CSS 4
  - JetBrains Mono font (for that futuristic programmer feel!)

- **Backend**
  - FastAPI
  - OpenAI GPT-4o-mini
  - Python 3.x
  - Uvicorn

## Project Structure

```
hopscotch/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HopscotchTrail.jsx   # Top navigation
│   │   │   ├── HopscotchBox.jsx     # Main box component
│   │   │   └── ResultCard.jsx       # Result display
│   │   ├── App.jsx                   # Main app logic
│   │   ├── index.css                 # Tailwind + custom styles
│   │   └── main.jsx
│   └── package.json
└── backend/
    ├── main.py                        # FastAPI server
    ├── pyproject.toml                 # Python dependencies (uv)
    └── .env                           # OpenAI API key
```

## License

MIT
