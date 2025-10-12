# Internship Aggregator

A complete internship aggregation system with automated scraping from multiple job sites and a responsive web dashboard.

## Features

- **Automated Scraping**: Collects internships from LinkedIn and Indeed every 6 hours
- **Smart Deduplication**: Prevents duplicate listings using content hashing
- **Real-time Search**: Filter internships by keyword, location, and source
- **Responsive Design**: Beautiful, professional UI that works on all devices
- **REST API**: Access internship data programmatically
- **Database-Backed**: Stores all data in Supabase with RLS security

## Architecture

### Backend (Python)
- **FastAPI**: REST API server
- **BeautifulSoup & Requests**: Web scraping
- **APScheduler**: Automated 6-hour scraping
- **Supabase**: Database client

### Frontend (React + TypeScript)
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Supabase Client**: Real-time data access

## Quick Start

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure `.env` with your Supabase credentials

4. Start the API server:
```bash
python -m api.main
```

API will be available at `http://localhost:8000`

## Database Schema

### internships table
- Stores all scraped internship listings
- Indexed on date_posted, source_site, and job_title
- Public read access via RLS

### scrape_logs table
- Tracks scraping runs and performance
- Logs errors for debugging
- Public read access via RLS

## Search & Filters

The dashboard supports:
- **Keyword search**: Search in job titles and descriptions
- **Location filter**: Find internships in specific cities/countries
- **Source filter**: View listings from specific platforms
- **Date sorting**: Most recent listings appear first

## API Usage

### Get all internships
```bash
curl http://localhost:8000/internships?limit=50
```

### Search internships
```bash
curl "http://localhost:8000/internships/search?keyword=AI&location=Remote"
```

### Get last update info
```bash
curl http://localhost:8000/stats/last_update
```

### Trigger manual scrape
```bash
curl -X POST http://localhost:8000/scrape/trigger
```

## Customization

### Add more job sites
1. Create a new scraper in `backend/scrapers/`
2. Inherit from `BaseScraper`
3. Implement the `scrape()` method
4. Add to `scheduler.py`

### Change scraping frequency
Edit `SCRAPE_INTERVAL_HOURS` in `backend/config.py`

### Modify search keywords
Edit `SCRAPE_KEYWORDS` in `backend/config.py`

## Tech Stack

**Backend:**
- Python 3.9+
- FastAPI
- BeautifulSoup4
- Supabase Python Client
- APScheduler

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase JS Client

**Database:**
- Supabase (PostgreSQL)

## License

MIT
