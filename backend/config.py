import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

SCRAPE_KEYWORDS = [
    "internship (data OR AI OR software OR machine learning OR developer)",
    "intern (data OR AI OR software OR machine learning OR developer)",
    "internship",
    "intern",
]

SCRAPE_LOCATIONS = [
    "Casablanca",
    "Rabat",
    "Tanger",
    "Fes",
    "Marrakech",
    "Agadir",
    "Morocco",
    "Remote",
    "Worldwide",
    "Global",
    # "Remote",
    # "Africa",
    # "Europe",
    # "France",
    # "Germany",
    # "Netherlands",
    # "Spain",
]

SCRAPE_INTERVAL_HOURS = 6