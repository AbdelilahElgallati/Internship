from abc import ABC, abstractmethod
from typing import List, Dict
from utils.db_client import DatabaseClient
from utils.data_normalizer import DataNormalizer

class BaseScraper(ABC):
    def __init__(self, source_site: str):
        self.source_site = source_site
        self.db_client = DatabaseClient()
        self.normalizer = DataNormalizer()

    @abstractmethod
    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        pass

    def save_results(self, raw_results: List[Dict]) -> int:
        log_id = self.db_client.log_scrape_start(self.source_site)
        inserted_count = 0
        try:
            if not raw_results:
                self.db_client.log_scrape_end(log_id, 0, 'success')
                return 0

            normalized_results = self.normalizer.normalize_internship_batch(raw_results)
            inserted_count = self.db_client.insert_internships_batch(normalized_results)
            self.db_client.log_scrape_end(log_id, inserted_count, 'success')
            return inserted_count
        except Exception as e:
            self.db_client.log_scrape_end(log_id, inserted_count, 'failed', str(e))
            # Re-raise the exception to be caught by the scheduler
            raise e

    def run(self, keywords: List[str], locations: List[str]) -> int:
        print(f"[{self.source_site}] Starting scrape...")
        raw_results = self.scrape(keywords, locations)
        print(f"[{self.source_site}] Found {len(raw_results)} potential results.")

        inserted_count = self.save_results(raw_results)
        print(f"[{self.source_site}] Inserted {inserted_count} new internships.")
        return inserted_count