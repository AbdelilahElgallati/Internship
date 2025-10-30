import scrapy
from typing import List
from scrapers.base_scraper import BaseScraper
from config import LINKEDIN_BASE_URL, LINKEDIN_MAX_PAGES, LINKEDIN_DAYS_AGO

class LinkedInSpider(scrapy.Spider):
    name = 'linkedin_spider'
    
    def __init__(self, keywords=None, locations=None, source_site='LinkedIn', results_container=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.keywords = keywords or []
        self.locations = locations or []
        self.source_site = source_site
        self.results_container = results_container if results_container is not None else []
        self.base_url = LINKEDIN_BASE_URL
        self.max_pages = LINKEDIN_MAX_PAGES
        self.days_ago = LINKEDIN_DAYS_AGO
        
    def start_requests(self):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.linkedin.com/jobs/search'
        }
        
        for keyword in self.keywords:
            for location in self.locations:
                self.logger.info(f"Searching: '{keyword}' in '{location}'")
                
                for page in range(self.max_pages):
                    start = page * 25
                    params = {
                        'keywords': f"{keyword} internship",
                        'location': location,
                        'f_TPR': f'r{self.days_ago * 24 * 3600}',
                        'f_JT': 'I',  # Job Type: Internship
                        'start': start,
                        'sortBy': 'DD'  # Date Descending
                    }
                    
                    url = self.base_url + '?' + '&'.join([f"{k}={v}" for k, v in params.items()])
                    
                    yield scrapy.Request(
                        url=url,
                        callback=self.parse,
                        headers=headers,
                        meta={
                            'keyword': keyword,
                            'location': location,
                            'page': page + 1
                        },
                        dont_filter=True
                    )
    
    def parse(self, response):
        keyword = response.meta['keyword']
        location = response.meta['location']
        page = response.meta['page']
        
        self.logger.info(f"Parsing page {page} for '{keyword}' in '{location}'")
        
        job_cards = response.css('li')
        
        if not job_cards:
            self.logger.warning(f"No job cards found on page {page}")
            return
        
        found_jobs = 0
        for card in job_cards:
            job_data = self.extract_job_data(card)
            if job_data:
                self.results_container.append(job_data)
                found_jobs += 1
        
        self.logger.info(f"Found {found_jobs} valid jobs on page {page}")
    
    def extract_job_data(self, card):
        try:
            title = card.css('h3.base-search-card__title::text').get()
            if not title:
                return None
            
            title = title.strip()
            
            company = card.css('h4.base-search-card__subtitle::text').get()
            company = company.strip() if company else 'N/A'
            
            location = card.css('span.job-search-card__location::text').get()
            location = location.strip() if location else 'N/A'
            
            link = card.css('a.base-card__full-link::attr(href)').get()
            apply_link = link.split('?')[0] if link else ''
            
            date_elem = card.css('time.job-search-card__listdate::attr(datetime)').get()
            date_posted = date_elem if date_elem else 'Recently'
            
            return {
                'job_title': title,
                'company_name': company,
                'location': location,
                'date_posted': date_posted,
                'employment_type': 'Internship',
                'job_description': f"{title} at {company}",
                'apply_link': apply_link,
                'source_site': self.source_site,
                'salary': ''
            }
        except Exception as e:
            self.logger.error(f"Error extracting job data: {e}")
            return None

class LinkedInScraper(BaseScraper):
    def __init__(self):
        super().__init__("LinkedIn")
    
    def get_spider_class(self):
        return LinkedInSpider