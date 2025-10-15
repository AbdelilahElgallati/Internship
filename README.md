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
- **APScheduler**: Automated 4-hour scraping
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
# InternHub Frontend

A modern React + TypeScript dashboard for searching and visualizing internship opportunities, powered by Supabase.

## Features

- **Live Search & Filtering:**  
  Search internships by job title, company, description, location, and source.  
  Filter and sort results with instant feedback.

- **Responsive UI:**  
  Beautiful, mobile-friendly design using Tailwind CSS and Lucide icons.

- **Analytics Dashboard:**  
  View real-time statistics: total internships, top sources, locations, and companies.

- **Pagination:**  
  Browse large result sets with fast, animated pagination.

- **Supabase Integration:**  
  Fetches data directly from Supabase tables and RPC functions.

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript** for type safety
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Supabase JS Client** for backend data

## Folder Structure

```
src/
├── App.tsx                # Main app component
├── main.tsx               # Entry point
├── index.css              # Tailwind base styles
├── lib/
│   └── supabase.ts        # Supabase client & types
├── hooks/
│   ├── useInternships.ts  # Custom hook for internships data
│   └── useLastUpdate.ts   # Custom hook for last update info
└── components/
    ├── InternshipCard.tsx # Card UI for each internship
    ├── SearchFilters.tsx  # Search/filter/sort controls
    └── StatsDashboard.tsx # Analytics dashboard
```

## Usage

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Environment Variables

Set your Supabase project credentials in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## How It Works

- **Internship Data:**  
  Fetched from the `internships` table in Supabase, with support for keyword, location, and source filters.

- **Statistics:**  
  Uses the `get_internship_statistics` RPC function for aggregated analytics.

- **UI Components:**  
  - [`InternshipCard`](src/components/InternshipCard.tsx): Displays job details and apply link.
  - [`SearchFilters`](src/components/SearchFilters.tsx): Controls for searching, filtering, and sorting.
  - [`StatsDashboard`](src/components/StatsDashboard.tsx): Shows key metrics and distributions.

- **Hooks:**  
  - [`useInternships`](src/hooks/useInternships.ts): Manages internship data and filters.
  - [`useLastUpdate`](src/hooks/useLastUpdate.ts): Tracks last scraping update.

## Customization

- **Add new filters:**  
  Extend [`useInternships`](src/hooks/useInternships.ts) and [`SearchFilters`](src/components/SearchFilters.tsx).

- **Change styling:**  
  Edit [`index.css`](src/index.css) and Tailwind config.

- **Connect to other Supabase tables:**  
  Update [`supabase.ts`](src/lib/supabase.ts) with new types and queries.

## License

MIT

---

For backend/API setup, see the main project README.