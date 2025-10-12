import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

SCRAPE_KEYWORDS = [
    "data science intern",
    "AI intern",
    "software engineer intern",
    "machine learning intern",
    "developer intern",
    "full stack intern",
    "backend intern",
    "frontend intern"
]

SCRAPE_INTERVAL_HOURS = 6
