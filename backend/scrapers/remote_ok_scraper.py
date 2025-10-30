import scrapy
import json
from typing import List
from scrapers.base_scraper import BaseScraper
from config import REMOTEOK_API_URL

class RemoteOKSpider(scrapy.Spider):
    name = 'remoteok_spider'
    
    def __init__(self, keywords=None, locations=None, source_site='RemoteOK', results_container=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.keywords = keywords or []
        self.source_site = source_site
        self.results_container = results_container if results_container is not None else []
        self.api_url = REMOTEOK_API_URL
        
    def start_requests(self):
        self.logger.info("Fetching jobs from RemoteOK API...")
        
        yield scrapy.Request(
            url=self.api_url,
            callback=self.parse,
            dont_filter=True
        )
    
    def parse(self, response):
        try:
            jobs = json.loads(response.text)
            
            if not jobs or not isinstance(jobs, list) or len(jobs) < 2:
                self.logger.warning("API returned no job data")
                return
            
            jobs = jobs[1:]
            self.logger.info(f"Fetched {len(jobs)} total remote jobs")
            
            found_jobs = 0
            for job in jobs:
                if self._matches_criteria(job):
                    job_data = self._format_job(job)
                    if job_data:
                        self.results_container.append(job_data)
                        found_jobs += 1
            
            self.logger.info(f"Found {found_jobs} matching internships after filtering")
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON response: {e}")
        except Exception as e:
            self.logger.error(f"Error processing RemoteOK API response: {e}")
    
    def _matches_criteria(self, job: dict) -> bool:
        text_to_check = (
            job.get('position', '') + ' ' +
            job.get('description', '') + ' ' +
            ' '.join(job.get('tags', []))
        ).lower()
        
        internship_terms = ['intern', 'internship', 'trainee', 'stage']
        is_internship = any(term in text_to_check for term in internship_terms)
        
        if not is_internship:
            return False
        
        if self.keywords and not any(kw.lower() in text_to_check for kw in self.keywords):
            return False
        
        return True
    
    def _format_job(self, job: dict) -> dict:
        try:
            salary_min = job.get('salary_min', 0)
            salary_max = job.get('salary_max', 0)
            salary = f"${salary_min} - ${salary_max}" if salary_min > 0 else "Not specified"
            
            raw_description = job.get('description', '')
            
            from scrapy.selector import Selector
            selector = Selector(text=raw_description)
            clean_description = ' '.join(selector.css('*::text').getall()).strip()
            
            return {
                'job_title': job.get('position', 'N/A'),
                'company_name': job.get('company', 'N/A'),
                'location': 'Remote',
                'date_posted': job.get('date', 'Recently'),
                'employment_type': 'Internship',
                'job_description': clean_description,
                'apply_link': job.get('url', ''),
                'salary': salary,
                'source_site': self.source_site
            }
        except Exception as e:
            self.logger.error(f"Error formatting job data: {e}")
            return None

class RemoteOKScraper(BaseScraper):
    def __init__(self):
        super().__init__("RemoteOK")
    
    def get_spider_class(self):
        return RemoteOKSpider