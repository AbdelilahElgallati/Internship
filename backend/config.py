import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

SCRAPE_KEYWORDS = [
    "internship (data OR AI OR software OR machine learning OR developer)",
]

SCRAPE_LOCATIONS = [
    "Morocco",
    "Remote",
    "Africa",
    "Europe",
]

SCRAPE_INTERVAL_HOURS = 6