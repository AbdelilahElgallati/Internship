# Internship Aggregator Backend

Python-based backend that scrapes internship listings from multiple job sites and provides a REST API.

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Install Playwright browsers (for dynamic scraping):
```bash
playwright install
```

## Running the API Server

Start the FastAPI server with automatic scraping scheduler:

```bash
cd backend
python -m api.main
```

The server will:
- Start on `http://localhost:8000`
- Automatically scrape internships every 6 hours
- Run an initial scrape on startup

## API Endpoints

### GET /internships
Returns all internships with pagination.

Query Parameters:
- `limit` (default: 100, max: 500)
- `offset` (default: 0)

### GET /internships/search
Search internships with filters.

Query Parameters:
- `keyword`: Search in job title and description
- `location`: Filter by location
- `source_site`: Filter by source (LinkedIn, Indeed)
- `limit`: Results limit

### GET /stats/last_update
Returns information about the last scraping run.

### POST /scrape/trigger
Manually trigger a scraping run.

## Project Structure

```
backend/
├── api/
│   └── main.py           # FastAPI application
├── scrapers/
│   ├── base_scraper.py   # Base scraper class
│   ├── indeed_scraper.py # Indeed scraper
│   └── linkedin_scraper.py # LinkedIn scraper
├── utils/
│   ├── db_client.py      # Supabase database client
│   └── data_normalizer.py # Data cleaning utilities
├── config.py             # Configuration settings
├── scheduler.py          # Scraping scheduler
└── requirements.txt      # Python dependencies
```

## Adding New Scrapers

1. Create a new scraper class inheriting from `BaseScraper`
2. Implement the `scrape()` method
3. Add the scraper to `scheduler.py`

Example:
```python
from scrapers.base_scraper import BaseScraper

class NewSiteScraper(BaseScraper):
    def __init__(self):
        super().__init__("NewSite")

    def scrape(self, keywords):
        # Implement scraping logic
        return results
```

## Notes

- Scraping respects rate limits with built-in delays
- Duplicates are prevented using content hashing
- All scraped data is normalized before storage
- RLS policies ensure secure data access
