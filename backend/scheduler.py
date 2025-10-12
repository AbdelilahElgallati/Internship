from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from scrapers.indeed_scraper import IndeedScraper
from scrapers.linkedin_scraper import LinkedInScraper
from config import SCRAPE_KEYWORDS, SCRAPE_INTERVAL_HOURS

class ScraperScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scrapers = [
            IndeedScraper(),
            LinkedInScraper()
        ]

    def scrape_all_sites(self):
        print(f"\n{'='*50}")
        print(f"Starting scheduled scrape at {datetime.utcnow()}")
        print(f"{'='*50}\n")

        total_inserted = 0

        for scraper in self.scrapers:
            try:
                inserted_count = scraper.run(SCRAPE_KEYWORDS)
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

        self.scrape_all_sites()

        self.scheduler.start()
        print(f"Scheduler started. Will scrape every {SCRAPE_INTERVAL_HOURS} hours.")

    def stop(self):
        self.scheduler.shutdown()
        print("Scheduler stopped.")
