import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

SCRAPE_INTERVAL_HOURS = 2

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

# INDEED_BASE_URL = "https://ma.indeed.com"
# INDEED_MAX_PAGES = 2
# INDEED_DAYS_AGO = 14

LINKEDIN_BASE_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
LINKEDIN_MAX_PAGES = 5
LINKEDIN_DAYS_AGO = 7

REMOTEOK_API_URL = "https://remoteok.com/api"

REKRUTE_MAX_PAGES = 5