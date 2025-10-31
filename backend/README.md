# Internship Aggregator API

A backend API that automatically scrapes and aggregates internship postings from multiple job sites (LinkedIn, Rekrute, RemoteOK). It provides a FastAPI interface to search and retrieve the aggregated data, which is stored in a Supabase database.

## Tech Stack

* **API**: FastAPI
* **Scraping**: Scrapy
* **Database**: Supabase (PostgreSQL)
* **Scheduling**: APScheduler

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```
   

2.  **Setup Database:**
    * Run the SQL script in `backend/utils/table.sql` on your Supabase instance to create the required tables and functions.

3.  **Configure Environment:**
    * Create a `.env` file in the `backend/` directory.
    * Add your Supabase credentials:
      ```env
      SUPABASE_URL="your_supabase_url"
      SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key"
      ```

4.  **Run the Server:**
    ```bash
    uvicorn backend.main:app --host 0.0.0.0 --port 8000
    ```
   

## Key API Endpoints



* `GET /internships`: Get paginated internship listings.
* `GET /internships/search`: Search for internships by keyword, location, or source.
* `GET /internships/stats`: Get aggregated statistics (total count, by source, etc.).
* `GET /stats/last_update`: Check the status of the most recent scrape.
* `POST /scrape/trigger`: Manually start a new background scraping cycle.