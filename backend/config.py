import os
from dotenv import load_dotenv

load_dotenv()

# --- Database Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# --- Scheduler Configuration ---
SCRAPE_INTERVAL_HOURS = 2
MAX_CONCURRENT_SCRAPERS = 3

# --- General Scraping Parameters ---
# MODIFIED: Keywords are now simpler for more effective matching.
SCRAPE_KEYWORDS = [
    "software",
    "data analyst",
    "machine learning",
    "web developer",
    "pfe",
]

SCRAPE_LOCATIONS = [
    "Casablanca",
    "Rabat",
    "Morocco",
    "Remote",
    "France"
]


# INDEED
# MODIFIED: Using Moroccan domain to appear more local
INDEED_BASE_URL = "https://ma.indeed.com"
INDEED_MAX_PAGES = 2 # Reduced to be less aggressive
INDEED_DAYS_AGO = 14

# LINKEDIN
LINKEDIN_BASE_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
LINKEDIN_MAX_PAGES = 5
LINKEDIN_DAYS_AGO = 7

# REMOTEOK
REMOTEOK_API_URL = "https://remoteok.com/api"

# REKRUTE.COM - REQUESTS BASED (STABLE MOROCCAN SOURCE)
REKRUTE_MAX_PAGES = 5 # Number of pages to scrape (20 jobs per page)