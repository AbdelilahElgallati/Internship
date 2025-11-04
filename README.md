# Internship Aggregator
A complete web application (Frontend + Backend) for aggregating and searching internship offers.
The backend uses **FastAPI** and **Scrapy** to scrape data and stores it in **Supabase**. Scraping is automated with **APScheduler**.

## Tech Stack
* **Backend**: FastAPI, Scrapy, Supabase, APScheduler
* **Frontend**: React / Next.js, TailwindCSS

## Installation

### Backend
1. **Navigate to the folder:**
    ```bash
    cd backend
    ```
2. **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
  
3. **Configure the database:**
    * Run the SQL script `backend/utils/table.sql` in your Supabase SQL editor.
4. **Environment variables:**
    * Create a `.env` file at the root of `backend/`.
    * Add your Supabase keys (use `backend/.env` as a model):
      ```env
      SUPABASE_URL="your_supabase_url"
      SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key"
      ```
5. **Launch the backend server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```
  
### Frontend
1. **Install Node.js dependencies:**
    ```bash
    npm install
    ```
2. **Environment variables:**
    * Create a `.env.local` file at the root.
    * Add your backend API URL:
      ```env
      NEXT_PUBLIC_API_URL="http://localhost:8000"
      ```
3. **Launch the development server:**
    ```bash
    npm run dev
    ```

## Main API Endpoints
* `GET /internships`: Retrieve internship offers (paginated).
* `GET /internships/search`: Search for internships (by `keyword`, `location`, etc.).
* `GET /internships/stats`: Get aggregated statistics.
* `GET /stats/last_update`: View the status of the last scraping.
* `POST /scrape/trigger`: Manually launch a new scraping cycle.
