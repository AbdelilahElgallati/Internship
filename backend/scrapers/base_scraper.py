from abc import ABC, abstractmethod
from typing import List, Dict
import scrapy
from scrapy.crawler import CrawlerProcess
from utils.db_client import DatabaseClient
from utils.data_normalizer import DataNormalizer

class BaseScraper(ABC):
    def __init__(self, source_site: str):
        self.source_site = source_site
        self.db_client = DatabaseClient()
        self.normalizer = DataNormalizer()
        self.results = []

    @abstractmethod
    def get_spider_class(self):
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
            raise e

    def run(self, keywords: List[str], locations: List[str]) -> int:
        print(f"[{self.source_site}] Starting scrape...")
        
        spider_class = self.get_spider_class()
        
        settings = {
            'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'ROBOTSTXT_OBEY': False,
            'CONCURRENT_REQUESTS': 1,
            'DOWNLOAD_DELAY': 2,
            'COOKIES_ENABLED': True,
            'RETRY_TIMES': 3,
            'RETRY_HTTP_CODES': [500, 502, 503, 504, 408, 429],
            'DOWNLOADER_MIDDLEWARES': {
                'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
                'scrapy.downloadermiddlewares.retry.RetryMiddleware': 90,
            },
            'LOG_LEVEL': 'INFO',
        }
        
        process = CrawlerProcess(settings=settings)
        
        process.crawl(
            spider_class,
            keywords=keywords,
            locations=locations,
            source_site=self.source_site,
            results_container=self.results
        )
        process.start()
        
        print(f"[{self.source_site}] Found {len(self.results)} potential results.")
        
        inserted_count = self.save_results(self.results)
        print(f"[{self.source_site}] Inserted {inserted_count} new internships.")
        
        self.results = []
        
        return inserted_count