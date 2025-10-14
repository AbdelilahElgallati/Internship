import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import time
import random
from scrapers.base_scraper import BaseScraper
from config import REKRUTE_MAX_PAGES

class RekruteScraper(BaseScraper):
    """
    Scraper for rekrute.com, a leading job board in Morocco.
    This scraper is stable as it doesn't rely on Selenium.
    """
    def __init__(self):
        super().__init__("Rekrute")
        self.base_url = "https://www.rekrute.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        })
        # Map location names to the IDs rekrute.com uses in search queries
        self.LOCATION_TO_ID_MAP = {
            'casablanca': '16', 'rabat': '13', 'marrakech': '10',
            'tanger': '15', 'agadir': '1', 'fes': '7',
            'morocco': '' # Empty string for "all of Morocco"
        }

    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []
        for keyword in keywords:
            for location_name in locations:
                location_id = self.LOCATION_TO_ID_MAP.get(location_name.lower())
                
                # Skip if the location is not relevant for this Moroccan site
                if location_id is None:
                    continue

                print(f"\n🇲🇦 [Rekrute.com] Searching: '{keyword}' in '{location_name}'")
                try:
                    results = self._search_and_scrape(keyword, location_id)
                    all_results.extend(results)
                    time.sleep(random.uniform(3, 6))
                except Exception as e:
                    print(f"❌ [Rekrute.com] Error searching '{keyword}' in '{location_name}': {e}")
        return all_results

    def _search_and_scrape(self, keyword: str, location_id: str) -> List[Dict]:
        jobs = []
        for page in range(1, REKRUTE_MAX_PAGES + 1):
            url = f"{self.base_url}/offres.html"
            params = {
                'q': f"stage {keyword}", # Prepend "stage" to narrow search
                'region[]': location_id,
                'p': page
            }
            try:
                print(f"📄 [Rekrute.com] Scraping page {page}...")
                response = self.session.get(url, params=params, timeout=25)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                job_cards = soup.select('li.post-id')
                if not job_cards:
                    print("⏹️ [Rekrute.com] No more job cards found.")
                    break

                for card in job_cards:
                    job_data = self._parse_job_card(card)
                    if job_data:
                        jobs.append(job_data)
                
                time.sleep(random.uniform(1, 3))
            except requests.RequestException as e:
                print(f"❌ [Rekrute.com] Network error on page {page}: {e}")
                break
        return jobs

    def _parse_job_card(self, card: BeautifulSoup) -> Optional[Dict]:
        try:
            title_elem = card.select_one('h2 a')
            if not title_elem: return None

            job_title = title_elem.get_text(strip=True)
            apply_link = title_elem.get('href')

            company_name_elem = card.select_one('div.holder a[href*="/recruteur/"]')
            company_name = company_name_elem.get_text(strip=True) if company_name_elem else 'N/A'
            
            # The date and location are in the same div, we need to find them carefully
            meta_spans = card.select('div.holder em.date span')
            date_posted = meta_spans[0].get_text(strip=True) if meta_spans else 'Recently'
            location = meta_spans[1].get_text(strip=True) if len(meta_spans) > 1 else 'N/A'

            # Get the snippet/description
            description_elem = card.select_one('div.text-style-1 p')
            description = description_elem.get_text(strip=True) if description_elem else f"{job_title} at {company_name}"

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
        except Exception:
            return None