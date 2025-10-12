import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from scrapers.base_scraper import BaseScraper
import time

class LinkedInScraper(BaseScraper):
    def __init__(self):
        super().__init__("LinkedIn")
        self.base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def scrape(self, keywords: List[str]) -> List[Dict]:
        all_results = []

        for keyword in keywords:
            try:
                results = self._scrape_keyword(keyword)
                all_results.extend(results)
                time.sleep(2)
            except Exception as e:
                print(f"Error scraping LinkedIn for '{keyword}': {str(e)}")
                continue

        return all_results

    def _scrape_keyword(self, keyword: str) -> List[Dict]:
        results = []

        params = {
            'keywords': keyword,
            'location': '',
            'f_TPR': 'r86400',
            'start': 0
        }

        try:
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            job_cards = soup.find_all('li')

            for card in job_cards[:20]:
                try:
                    title_elem = card.find('h3', class_='base-search-card__title')
                    if not title_elem:
                        continue

                    job_title = title_elem.get_text(strip=True)

                    company_elem = card.find('h4', class_='base-search-card__subtitle')
                    company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown'

                    location_elem = card.find('span', class_='job-search-card__location')
                    location = location_elem.get_text(strip=True) if location_elem else 'Remote'

                    link_elem = card.find('a', class_='base-card__full-link')
                    apply_link = link_elem.get('href', '') if link_elem else ''

                    date_elem = card.find('time')
                    date_posted = date_elem.get('datetime', 'Recently') if date_elem else 'Recently'

                    if not apply_link:
                        continue

                    results.append({
                        'job_title': job_title,
                        'company_name': company_name,
                        'location': location,
                        'date_posted': date_posted,
                        'employment_type': 'Internship',
                        'job_description': f"{job_title} at {company_name}",
                        'apply_link': apply_link,
                        'source_site': self.source_site
                    })

                except Exception as e:
                    print(f"Error parsing LinkedIn job card: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error fetching LinkedIn results: {str(e)}")

        return results
