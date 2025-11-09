# Hopscotch - Visual Discovery Journey

A playful, cartoon-style search interface where you hop through numbered boxes to discover visual content. Built with React and FastAPI, powered by OpenAI.

## Features

- Cartoon retro design with bright colors and playful animations
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

4. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

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

## Deployment to Vercel

### Deploy Frontend

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy frontend:
   ```bash
   cd frontend
   vercel
   ```

3. Follow the prompts to deploy

### Deploy Backend

You'll need to deploy the FastAPI backend separately. Options:

1. **Railway** - Easy Python deployment
2. **Render** - Free tier available
3. **Heroku** - Classic option
4. **Vercel Serverless Functions** - Convert FastAPI to serverless

After deploying the backend, update the API URL in `frontend/src/App.jsx` from `http://localhost:8000` to your production backend URL.

## Environment Variables for Production

### Frontend
- No environment variables needed (API URL is hardcoded)

### Backend
- `OPENAI_API_KEY` - Your OpenAI API key

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
