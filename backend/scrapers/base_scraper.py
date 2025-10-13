from abc import ABC, abstractmethod
from typing import List, Dict
from utils.db_client import DatabaseClient
from utils.data_normalizer import DataNormalizer

class BaseScraper(ABC):
    def __init__(self, source_site: str):
        self.source_site = source_site
        self.db_client = DatabaseClient()
        self.normalizer = DataNormalizer()

    # Updated abstract method signature
    @abstractmethod
    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        pass

    def save_results(self, raw_results: List[Dict]) -> int:
        log_id = self.db_client.log_scrape_start(self.source_site)

        try:
            normalized_results = [
                self.normalizer.normalize_internship(result)
                for result in raw_results
            ]

            inserted_count = self.db_client.insert_internships_batch(normalized_results)

            self.db_client.log_scrape_end(log_id, inserted_count, 'success')
            return inserted_count

        except Exception as e:
            self.db_client.log_scrape_end(log_id, 0, 'failed', str(e))
            raise e

    # Updated run method signature and call to self.scrape
    def run(self, keywords: List[str], locations: List[str]) -> int:
        print(f"Starting scrape for {self.source_site}...")
        raw_results = self.scrape(keywords, locations)
        print(f"Found {len(raw_results)} results from {self.source_site}")

        inserted_count = self.save_results(raw_results)
        print(f"Inserted {inserted_count} new internships from {self.source_site}")

        return inserted_count