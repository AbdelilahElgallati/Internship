import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import time
import random
from scrapers.base_scraper import BaseScraper
from config import LINKEDIN_BASE_URL, LINKEDIN_MAX_PAGES, LINKEDIN_DAYS_AGO

class LinkedInScraper(BaseScraper):
    def __init__(self):
        super().__init__("LinkedIn")
        self.base_url = LINKEDIN_BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.linkedin.com/jobs/search'
        })

    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []
        for keyword in keywords:
            for location in locations:
                print(f"\n🔍 [LinkedIn] Searching: '{keyword}' in '{location}'")
                try:
                    results = self._scrape_keyword_location(keyword, location)
                    all_results.extend(results)
                    time.sleep(random.uniform(4, 8))
                except Exception as e:
                    print(f"❌ [LinkedIn] Error for '{keyword}' in '{location}': {e}")
                    continue
        return all_results

    def _scrape_keyword_location(self, keyword: str, location: str) -> List[Dict]:
        results = []
        for page in range(LINKEDIN_MAX_PAGES):
            start = page * 25
            params = {
                'keywords': f"{keyword} internship", 
                'location': location,
                'f_TPR': f'r{LINKEDIN_DAYS_AGO * 24 * 3600}',
                'f_JT': 'I', # Job Type: Internship
                'start': start,
                'sortBy': 'DD' # Date Descending
            }
            try:
                print(f"📄 [LinkedIn] Scraping page {page + 1}...")
                response = self.session.get(self.base_url, params=params, timeout=20)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')
                job_cards = soup.find_all('li')

                if not job_cards:
                    print("⏹️ [LinkedIn] No more job cards found.")
                    break

                for card in job_cards:
                    job_data = self.extract_job_data(card)
                    if job_data:
                        results.append(job_data)
                
                time.sleep(random.uniform(2, 5))

            except requests.exceptions.RequestException as e:
                print(f"❌ [LinkedIn] Network error on page {page + 1}: {e}")
                # Stop for this keyword/location pair if blocked
                break
        return results

    def extract_job_data(self, card) -> Dict:
        """Extracts job data from a single job card soup object."""
        title_elem = card.find('h3', class_='base-search-card__title')
        if not title_elem:
            return None

        job_title = title_elem.get_text(strip=True)
        company_elem = card.find('h4', class_='base-search-card__subtitle')
        company_name = company_elem.get_text(strip=True) if company_elem else 'N/A'
        location_elem = card.find('span', class_='job-search-card__location')
        location = location_elem.get_text(strip=True) if location_elem else 'N/A'
        link_elem = card.find('a', class_='base-card__full-link')
        apply_link = link_elem['href'].split('?')[0] if link_elem else ''
        date_elem = card.find('time', class_='job-search-card__listdate')
        date_posted = date_elem.get('datetime', 'Recently') if date_elem else 'Recently'

        # No separate request for description; we use what's available.
        # The DataNormalizer will handle creating a hash without a full description.
        return {
            'job_title': job_title,
            'company_name': company_name,
            'location': location,
            'date_posted': date_posted,
            'employment_type': 'Internship',
            'job_description': f"{job_title} at {company_name}", # Snippet
            'apply_link': apply_link,
            'source_site': self.source_site,
            'salary': ''
        }