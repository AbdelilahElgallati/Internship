# Backend Setup Guide

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Supabase account with service role key

## Step-by-Step Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit the `.env` file in the backend directory:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** You need the **service role key** (not the anon key) because the scrapers need permission to insert data into the database.

To find your service role key:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" secret key

### 3. Install Playwright (Optional)

If you want to use Playwright for more advanced scraping:

```bash
playwright install chromium
```

For basic scraping with BeautifulSoup and Requests, this step is optional.

### 4. Test Database Connection

Create a test script to verify your connection:

```bash
python -c "from utils.db_client import DatabaseClient; db = DatabaseClient(); print('Connection successful!')"
```

### 5. Run Your First Scrape

You can manually test the scrapers:

```python
# Test Indeed scraper
python -c "from scrapers.indeed_scraper import IndeedScraper; from config import SCRAPE_KEYWORDS; scraper = IndeedScraper(); scraper.run(SCRAPE_KEYWORDS[:1])"

# Test LinkedIn scraper
python -c "from scrapers.linkedin_scraper import LinkedInScraper; from config import SCRAPE_KEYWORDS; scraper = LinkedInScraper(); scraper.run(SCRAPE_KEYWORDS[:1])"
```

### 6. Start the API Server

```bash
python -m api.main
```

The server will:
- Start on http://localhost:8000
- Run an initial scrape on startup
- Schedule scraping every 6 hours automatically

### 7. Test the API

Visit http://localhost:8000 in your browser or use curl:

```bash
# Test API health
curl http://localhost:8000/

# Get internships
curl http://localhost:8000/internships

# Search internships
curl "http://localhost:8000/internships/search?keyword=AI"

# Get last update info
curl http://localhost:8000/stats/last_update
```

## Troubleshooting

### "Module not found" errors
Make sure you're in the backend directory and have installed all requirements:
```bash
cd backend
pip install -r requirements.txt
```

### Database connection errors
- Verify your SUPABASE_URL is correct
- Ensure you're using the service_role key, not the anon key
- Check that RLS policies are properly configured

### Scraping returns no results
- Check your internet connection
- Job sites may have changed their HTML structure
- Consider adding delays between requests
- Some sites may block automated requests

### Scheduler not running
- Check console logs for errors
- Verify APScheduler is installed
- The scheduler starts automatically when running main.py

## Production Deployment

For production deployment:

1. **Use environment variables** instead of .env files
2. **Add rate limiting** to protect your API
3. **Set up monitoring** for scraping failures
4. **Use a process manager** like systemd or supervisor
5. **Consider using proxies** for scraping at scale

Example systemd service:

```ini
[Unit]
Description=Internship Aggregator API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="SUPABASE_URL=your_url"
Environment="SUPABASE_SERVICE_ROLE_KEY=your_key"
ExecStart=/usr/bin/python3 -m api.main
Restart=always

[Install]
WantedBy=multi-user.target
```

## Customization

### Change scraping frequency
Edit `config.py`:
```python
SCRAPE_INTERVAL_HOURS = 6  # Change to your desired interval
```

### Add more keywords
Edit `config.py`:
```python
SCRAPE_KEYWORDS = [
    "data science intern",
    "your custom keyword",
    # Add more...
]
```

### Add more job sites
1. Create `backend/scrapers/yoursite_scraper.py`
2. Inherit from BaseScraper
3. Implement the scrape() method
4. Add to scheduler.py

## Support

For issues or questions, check:
- The main README.md
- Supabase documentation
- FastAPI documentation
