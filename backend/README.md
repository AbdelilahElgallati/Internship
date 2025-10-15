# Internship Aggregator Backend

A Python backend that scrapes internship listings from multiple job sites and exposes a REST API using FastAPI.

## Features

- Scrapes internships from LinkedIn, Indeed, Rekrute, RemoteOK, and more
- Normalizes and deduplicates data before storing in Supabase
- REST API for searching, filtering, and retrieving internships
- Scheduled scraping every 4 hours (with manual trigger support)
- Secure access via Supabase RLS policies

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create a `.env` file in `backend/`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Install Playwright browsers (for dynamic scraping):**
   ```bash
   playwright install
   ```

## Running the API Server

Start the FastAPI server (includes scraping scheduler):

```bash
cd backend
python -m api.main
```

- Server runs at `http://localhost:8000`
- Scrapes internships every 6 hours
- Runs an initial scrape on startup

## API Endpoints

- **GET /internships**  
  List internships (supports pagination: `limit`, `offset`)

- **GET /internships/search**  
  Search internships by `keyword`, `location`, `source_site`, `limit`

- **GET /stats/last_update**  
  Get info about the last scraping run

- **POST /scrape/trigger**  
  Manually trigger a scraping run

## Project Structure

```
backend/
├── api/
│   └── main.py               # FastAPI app
├── scrapers/
│   ├── base_scraper.py       # Scraper base class
│   ├── indeed_scraper.py     # Indeed scraper
│   ├── linkedin_scraper.py   # LinkedIn scraper
│   ├── rekrute_scraper.py    # Rekrute scraper
│   └── remote_ok_scraper.py  # RemoteOK scraper
├── utils/
│   ├── db_client.py          # Supabase DB client
│   └── data_normalizer.py    # Data normalization
├── config.py                 # Config settings
├── scheduler.py              # Scraping scheduler
├── requirements.txt          # Python dependencies
```

## Adding a New Scraper

1. Create a new class in `scrapers/` inheriting from `BaseScraper`
2. Implement the `scrape()` method
3. Register your scraper in `scheduler.py`

Example:
```python
from scrapers.base_scraper import BaseScraper

class NewSiteScraper(BaseScraper):
    def __init__(self):
        super().__init__("NewSite")

    def scrape(self, keywords):
        # Your scraping logic here
        return results
```

## Notes

- Scraping respects site rate limits and uses delays
- Duplicate internships are prevented using content hashing
- All data is normalized before storage
- Supabase RLS policies ensure secure data access

---

For more details, see `SETUP_GUIDE.md` and the code in each module.