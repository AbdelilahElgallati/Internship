import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scrapers.rekrute_scraper import RekruteScraper
from config import SCRAPE_KEYWORDS, SCRAPE_LOCATIONS

if __name__ == '__main__':
    try:
        scraper = RekruteScraper()
        count = scraper.run(keywords=SCRAPE_KEYWORDS, locations=SCRAPE_LOCATIONS)
        print(f"\n[SUCCESS] Rekrute scraper finished. Inserted {count} new internships.")
        sys.exit(0)
    except Exception as e:
        print(f"\n[FAILED] Rekrute scraper failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)