from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from scrapers.indeed_scraper import IndeedScraper
from scrapers.linkedin_scraper import LinkedInScraper
from scrapers.wttj_scraper import WelcomeToTheJungleScraper
from scrapers.stagiaires_ma_scraper import StagiairesMaScraper 
from config import SCRAPE_KEYWORDS, SCRAPE_INTERVAL_HOURS, SCRAPE_LOCATIONS
import threading 

class ScraperScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scrapers = [
            IndeedScraper(),
            LinkedInScraper(),
            WelcomeToTheJungleScraper(),
            StagiairesMaScraper(), 
        ]

    def scrape_all_sites(self):
        print(f"\n{'='*50}")
        print(f"Starting scheduled scrape at {datetime.utcnow()}")
        print(f"Scraping keywords: {len(SCRAPE_KEYWORDS)}")
        print(f"Scraping locations: {', '.join(SCRAPE_LOCATIONS)}")
        print(f"{'='*50}\n")

        total_inserted = 0

        for scraper in self.scrapers:
            try:
                # Pass both keywords and locations to run
                inserted_count = scraper.run(SCRAPE_KEYWORDS, SCRAPE_LOCATIONS) 
                total_inserted += inserted_count
            except Exception as e:
                print(f"Error running {scraper.source_site} scraper: {str(e)}")
                continue

        print(f"\n{'='*50}")
        print(f"Scrape completed. Total new internships: {total_inserted}")
        print(f"{'='*50}\n")

        return total_inserted

    def start(self):
        self.scheduler.add_job(
            func=self.scrape_all_sites,
            trigger=IntervalTrigger(hours=SCRAPE_INTERVAL_HOURS),
            id='scrape_internships',
            name='Scrape internships from all sources',
            replace_existing=True
        )

        # FIX: The initial synchronous call must be run in a separate thread 
        # to prevent blocking the main FastAPI asyncio loop.
        print("📡 Starting initial scrape in a dedicated thread...")
        initial_scrape_thread = threading.Thread(target=self.scrape_all_sites)
        initial_scrape_thread.start()

        self.scheduler.start()
        print(f"Scheduler started. Will scrape every {SCRAPE_INTERVAL_HOURS} hours.")

    def stop(self):
        self.scheduler.shutdown()
        print("Scheduler stopped.")