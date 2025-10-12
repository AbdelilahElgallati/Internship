import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from scrapers.base_scraper import BaseScraper
import time

class IndeedScraper(BaseScraper):
    def __init__(self):
        super().__init__("Indeed")
        self.base_url = "https://www.indeed.com/jobs"
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
                print(f"Error scraping Indeed for '{keyword}': {str(e)}")
                continue

        return all_results

    def _scrape_keyword(self, keyword: str) -> List[Dict]:
        results = []

        params = {
            'q': keyword,
            'l': '',
            'sort': 'date'
        }

        try:
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            job_cards = soup.find_all('div', class_='job_seen_beacon')

            for card in job_cards[:20]:
                try:
                    title_elem = card.find('h2', class_='jobTitle')
                    if not title_elem:
                        continue

                    job_title = title_elem.get_text(strip=True)
                    job_link_elem = title_elem.find('a')
                    job_id = job_link_elem.get('data-jk', '') if job_link_elem else ''

                    company_elem = card.find('span', {'data-testid': 'company-name'})
                    company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown'

                    location_elem = card.find('div', {'data-testid': 'text-location'})
                    location = location_elem.get_text(strip=True) if location_elem else 'Remote'

                    description_elem = card.find('div', class_='snippet')
                    description = description_elem.get_text(strip=True) if description_elem else ''

                    date_elem = card.find('span', class_='date')
                    date_posted = date_elem.get_text(strip=True) if date_elem else 'Recently'

                    apply_link = f"https://www.indeed.com/viewjob?jk={job_id}" if job_id else self.base_url

                    results.append({
                        'job_title': job_title,
                        'company_name': company_name,
                        'location': location,
                        'date_posted': date_posted,
                        'employment_type': 'Internship',
                        'job_description': description,
                        'apply_link': apply_link,
                        'source_site': self.source_site
                    })

                except Exception as e:
                    print(f"Error parsing job card: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error fetching Indeed results: {str(e)}")

        return results
