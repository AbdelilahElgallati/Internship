import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scrapers.remote_ok_scraper import RemoteOKScraper
from config import SCRAPE_KEYWORDS, SCRAPE_LOCATIONS

if __name__ == '__main__':
    try:
        scraper = RemoteOKScraper()
        count = scraper.run(keywords=SCRAPE_KEYWORDS, locations=SCRAPE_LOCATIONS)
        print(f"\n[SUCCESS] RemoteOK scraper finished. Inserted {count} new internships.")
        sys.exit(0)
    except Exception as e:
        print(f"\n[FAILED] RemoteOK scraper failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)