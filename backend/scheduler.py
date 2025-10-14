from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

from scrapers.indeed_scraper import IndeedScraper
from scrapers.linkedin_scraper import LinkedInScraper
from scrapers.remote_ok_scraper import RemoteOKScraper
from scrapers.rekrute_scraper import RekruteScraper
from config import SCRAPE_KEYWORDS, SCRAPE_INTERVAL_HOURS, SCRAPE_LOCATIONS, MAX_CONCURRENT_SCRAPERS

class ScraperScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler(daemon=True)
        self.scrapers = [
            LinkedInScraper(),
            RemoteOKScraper(),
            # IndeedScraper(),
            RekruteScraper(),

        ]

    def scrape_all_sites(self):
        """
        Scrapes all sites concurrently using a thread pool for efficiency.
        """
        start_time = datetime.utcnow()
        print(f"\n{'='*60}")
        print(f"🚀 Starting scheduled scrape at {start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"Scraping {len(SCRAPE_KEYWORDS)} keywords across {len(SCRAPE_LOCATIONS)} locations.")
        print(f"{'='*60}\n")

        total_inserted = 0
        
        with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_SCRAPERS) as executor:
            # Submit each scraper.run method to the executor
            future_to_scraper = {
                executor.submit(scraper.run, SCRAPE_KEYWORDS, SCRAPE_LOCATIONS): scraper
                for scraper in self.scrapers
            }
            
            for future in as_completed(future_to_scraper):
                scraper = future_to_scraper[future]
                try:
                    inserted_count = future.result()
                    total_inserted += inserted_count
                    print(f"✅ [{scraper.source_site}] Completed successfully. New internships: {inserted_count}")
                except Exception as e:
                    print(f"❌ [{scraper.source_site}] Scraper failed: {e}")

        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        print(f"\n{'='*60}")
        print(f"🏁 Scrape completed in {duration:.2f} seconds.")
        print(f"Total new internships added: {total_inserted}")
        print(f"{'='*60}\n")

        return total_inserted

    def start(self):
        """Starts the scheduler and runs an initial scrape in a non-blocking thread."""
        self.scheduler.add_job(
            func=self.scrape_all_sites,
            trigger=IntervalTrigger(hours=SCRAPE_INTERVAL_HOURS),
            id='scrape_internships',
            name='Scrape internships from all sources',
            replace_existing=True,
            next_run_time=datetime.now() # Schedule to run immediately on start
        )

        print("📡 Starting initial scrape in a background thread...")
        initial_scrape_thread = threading.Thread(target=self.scrape_all_sites)
        initial_scrape_thread.daemon = True
        initial_scrape_thread.start()

        self.scheduler.start()
        print(f"📅 Scheduler started. Will run every {SCRAPE_INTERVAL_HOURS} hours.")

    def stop(self):
        """Stops the scheduler."""
        self.scheduler.shutdown()
        print("Scheduler stopped.")