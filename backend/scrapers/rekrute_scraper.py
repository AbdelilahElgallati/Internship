import scrapy
from typing import List
from scrapers.base_scraper import BaseScraper
from config import REKRUTE_MAX_PAGES

class RekruteSpider(scrapy.Spider):
    name = 'rekrute_spider'
    
    LOCATION_TO_ID_MAP = {
        'casablanca': '16',
        'rabat': '13',
        'marrakech': '10',
        'tanger': '15',
        'agadir': '1',
        'fes': '7',
        'morocco': '' 
    }
    
    def __init__(self, keywords=None, locations=None, source_site='Rekrute', results_container=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.keywords = keywords or []
        self.locations = locations or []
        self.source_site = source_site
        self.results_container = results_container if results_container is not None else []
        self.base_url = "https://www.rekrute.com"
        self.max_pages = REKRUTE_MAX_PAGES
        
    def start_requests(self):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': f'{self.base_url}/'
        }

        for keyword in self.keywords:
            for location_name in self.locations:
                location_id = self.LOCATION_TO_ID_MAP.get(location_name.lower())
                
                if location_id is None:
                    continue
                
                self.logger.info(f"Searching: '{keyword}' in '{location_name}'")
                
                for page in range(1, self.max_pages + 1):
                    url = f"{self.base_url}/offres.html"
                    params = {
                        'q': f"stage {keyword}", 
                        'region[]': location_id,
                        'p': page
                    }
                    
                    param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
                    full_url = f"{url}?{param_string}"
                    
                    yield scrapy.Request(
                        url=full_url,
                        callback=self.parse,
                        headers=headers,
                        meta={
                            'keyword': keyword,
                            'location': location_name,
                            'page': page
                        },
                        dont_filter=True
                    )
    
    def parse(self, response):
        keyword = response.meta['keyword']
        location = response.meta['location']
        page = response.meta['page']
        
        self.logger.info(f"Parsing page {page} for '{keyword}' in '{location}'")
        
        job_cards = response.css('li.post-id')
        
        if not job_cards:
            self.logger.warning(f"No more job cards found on page {page}")
            return
        
        found_jobs = 0
        for card in job_cards:
            job_data = self.extract_job_data(card)
            if job_data:
                self.results_container.append(job_data)
                found_jobs += 1
        
        self.logger.info(f"Found {found_jobs} jobs on page {page}")
    
    def extract_job_data(self, card):
        try:
            title_elem = card.css('h2 a')
            if not title_elem:
                return None
            
            job_title = title_elem.css('::text').get()
            if not job_title:
                return None
            
            job_title = job_title.strip()
            
            apply_link = title_elem.css('::attr(href)').get()
            
            if apply_link and not apply_link.startswith('http'):
                apply_link = f"{self.base_url}{apply_link}" if apply_link.startswith('/') else f"{self.base_url}/{apply_link}"
            
            company_name = card.css('div.holder a[href*="/recruteur/"]::text').get()
            company_name = company_name.strip() if company_name else 'N/A'
            
            meta_spans = card.css('div.holder em.date span::text').getall()
            date_posted = meta_spans[0].strip() if meta_spans else 'Recently'
            location = meta_spans[1].strip() if len(meta_spans) > 1 else 'N/A'
            
            description = card.css('div.text-style-1 p::text').get()
            description = description.strip() if description else f"{job_title} at {company_name}"
            
            return {
                'job_title': job_title,
                'company_name': company_name,
                'location': location,
                'date_posted': date_posted,
                'employment_type': 'Internship',
                'job_description': description,
                'apply_link': apply_link,
                'salary': 'Not specified',
                'source_site': self.source_site
            }
        except Exception as e:
            self.logger.error(f"Error extracting job data: {e}")
            return None
        
    

class RekruteScraper(BaseScraper):
    def __init__(self):
        super().__init__("Rekrute")
    
    def get_spider_class(self):
        return RekruteSpider