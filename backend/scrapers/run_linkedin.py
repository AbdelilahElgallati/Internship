import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scrapers.linkedin_scraper import LinkedInScraper
from config import SCRAPE_KEYWORDS, SCRAPE_LOCATIONS

if __name__ == '__main__':
    try:
        scraper = LinkedInScraper()
        count = scraper.run(keywords=SCRAPE_KEYWORDS, locations=SCRAPE_LOCATIONS)
        print(f"\n[SUCCESS] LinkedIn scraper finished. Inserted {count} new internships.")
        sys.exit(0)
    except Exception as e:
        print(f"\n[FAILED] LinkedIn scraper failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)