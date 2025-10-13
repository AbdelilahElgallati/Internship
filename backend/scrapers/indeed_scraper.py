import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from scrapers.base_scraper import BaseScraper
import time
import random

class IndeedScraper(BaseScraper):
    def __init__(self):
        super().__init__("Indeed")
        self.base_url = "https://www.indeed.com/jobs"
        # Rotation de User-Agents pour éviter le blocage
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ]

    def _get_headers(self):
        """Génère des headers aléatoires pour éviter la détection"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }

    # Updated scrape method signature
    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []

        # Nested loop: keyword * location
        for keyword in keywords:
            for location in locations:
                try:
                    # Pass the specific location to the scraping function
                    results = self._scrape_keyword(keyword, location)
                    all_results.extend(results)
                    # Délai aléatoire entre les requêtes (3-7 secondes)
                    time.sleep(random.uniform(3, 7))
                except Exception as e:
                    # Updated print message to include location
                    print(f"Error scraping Indeed for '{keyword}' in '{location}': {str(e)}")
                    continue

        return all_results

    # Updated _scrape_keyword method signature
    def _scrape_keyword(self, keyword: str, location: str) -> List[Dict]:
        results = []

        params = {
            'q': keyword,
            'l': location, # Use the passed location parameter
            'sort': 'date',
            'fromage': '7'  # Limiter aux 7 derniers jours
        }

        try:
            # Utiliser une session pour conserver les cookies
            session = requests.Session()
            
            response = session.get(
                self.base_url, 
                params=params, 
                headers=self._get_headers(), 
                timeout=15,
                allow_redirects=True
            )
            
            # Si on reçoit un 403, essayer une approche alternative
            if response.status_code == 403:
                # Updated print message to include location
                print(f"Indeed blocked request for '{keyword}' in '{location}'. Trying alternative approach...")
                # Attendre plus longtemps
                time.sleep(random.uniform(5, 10))
                
                # Réessayer avec des headers différents
                response = session.get(
                    self.base_url, 
                    params=params, 
                    headers=self._get_headers(), 
                    timeout=15
                )
            
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Indeed peut utiliser différentes classes selon les versions
            job_cards = soup.find_all('div', class_='job_seen_beacon') or \
                       soup.find_all('div', class_='jobsearch-SerpJobCard') or \
                       soup.find_all('a', class_='jcs-JobTitle')

            if not job_cards:
                # Updated print message to include location
                print(f"No job cards found for '{keyword}' in '{location}'. Indeed may have changed structure or blocked.")
                return results

            for card in job_cards[:20]:
                try:
                    # Essayer différents sélecteurs
                    title_elem = card.find('h2', class_='jobTitle') or \
                                card.find('a', class_='jcs-JobTitle') or \
                                card.find('h2', class_='title')
                    
                    if not title_elem:
                        continue

                    job_title = title_elem.get_text(strip=True)
                    
                    # Récupérer le lien et l'ID
                    job_link_elem = title_elem.find('a') if title_elem.name != 'a' else title_elem
                    job_id = job_link_elem.get('data-jk', '') or \
                            job_link_elem.get('id', '').replace('job_', '') if job_link_elem else ''

                    # Company
                    company_elem = card.find('span', {'data-testid': 'company-name'}) or \
                                  card.find('span', class_='companyName') or \
                                  card.find('span', class_='company')
                    company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown'

                    # Location
                    location_elem = card.find('div', {'data-testid': 'text-location'}) or \
                                   card.find('div', class_='companyLocation') or \
                                   card.find('span', class_='location')
                    location_scraped = location_elem.get_text(strip=True) if location_elem else 'Remote'

                    # Description
                    description_elem = card.find('div', class_='snippet') or \
                                      card.find('div', class_='job-snippet')
                    description = description_elem.get_text(strip=True) if description_elem else ''

                    # Date
                    date_elem = card.find('span', class_='date') or \
                               card.find('span', {'data-testid': 'myJobsStateDate'})
                    date_posted = date_elem.get_text(strip=True) if date_elem else 'Recently'

                    apply_link = f"https://www.indeed.com/viewjob?jk={job_id}" if job_id else self.base_url

                    results.append({
                        'job_title': job_title,
                        'company_name': company_name,
                        'location': location_scraped,
                        'date_posted': date_posted,
                        'employment_type': 'Internship',
                        'job_description': description,
                        'apply_link': apply_link,
                        'source_site': self.source_site
                    })

                except Exception as e:
                    # Updated print message to include location
                    print(f"Error parsing job card for '{keyword}' in '{location}': {str(e)}")
                    continue
            
            # Added print to show results per keyword/location pair
            print(f"Parsed {len(results)} jobs from Indeed for '{keyword}' in '{location}'")

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                # Updated print message to include location
                print(f"Indeed is blocking requests for '{keyword}' in '{location}'. Consider using a proxy or API service.")
                print(f"Alternatively, reduce scraping frequency or implement Selenium.")
            else:
                # Updated print message to include location
                print(f"HTTP Error fetching Indeed results for '{keyword}' in '{location}': {str(e)}")
        except Exception as e:
            # Updated print message to include location
            print(f"Error fetching Indeed results for '{keyword}' in '{location}': {str(e)}")

        return results