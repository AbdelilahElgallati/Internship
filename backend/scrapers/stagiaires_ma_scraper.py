import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from scrapers.base_scraper import BaseScraper 
import time
import random
import re # Needed for robust CSS selector matching

class StagiairesMaScraper(BaseScraper):
    def __init__(self):
        super().__init__("StagiairesMa")
        # Base URL for job offers on Stagiaires.ma
        self.base_url = "https://www.stagiaires.ma/offres"
        self.JOBS_PER_PAGE = 10 
        self.MAX_PAGES = 5      # Limit pagination
        
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        ]

    def _get_headers(self):
        """Génère des headers aléatoires"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
            'Connection': 'keep-alive',
            'DNT': '1'
        }

    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []

        # Filter to target only Moroccan locations for this specialized site
        moroccan_locations = [loc for loc in locations if 'Morocco' in loc or loc in ['Casablanca', 'Rabat', 'Tanger', 'Fes', 'Marrakech', 'Agadir']]
        if not moroccan_locations:
             print("Skipping Stagiaires.ma: No Moroccan locations defined.")
             return []

        for keyword in keywords:
            for location in moroccan_locations:
                try:
                    results = self._scrape_keyword(keyword, location)
                    all_results.extend(results)
                    time.sleep(random.uniform(3, 7))
                except Exception as e:
                    print(f"Error scraping Stagiaires.ma for '{keyword}' in '{location}': {str(e)}")
                    continue

        return all_results

    def _scrape_keyword(self, keyword: str, location: str) -> List[Dict]:
        results = []
        current_page = 0
        session = requests.Session() 
        
        # We simplify the keyword for the URL search to use only the first word
        simple_keyword = keyword.split(' ')[0] 
        
        while current_page < self.MAX_PAGES:
            start_offset = current_page * self.JOBS_PER_PAGE
            
            params = {
                'q': simple_keyword,
                # Stagiaires.ma location filter works better with just the city name
                'ville': location.split(',')[0].strip(),
                'type': 'stage', # Explicitly search for stages
                'start': start_offset
            }
            
            try:
                print(f"-> Scraping Stagiaires.ma page {current_page + 1} for '{simple_keyword}' in '{location}' (start={start_offset})")
                
                response = session.get(
                    self.base_url,
                    params=params,
                    headers=self._get_headers(),
                    timeout=15
                )
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')

                # Using a generic selector pattern, which might need adjustment if the site changes
                # This assumes a job card is often an 'offre-item' or 'job-item' div
                job_cards = soup.find_all('div', class_=re.compile(r'job-item|offre-item|job-listing')) 

                if not job_cards:
                    # No results found
                    print(f"No job cards found on page {current_page + 1}. Stopping pagination.")
                    break 

                page_parsed_count = 0
                for card in job_cards:
                    try:
                        # 1. Title and Link 
                        title_elem = card.find('h3') or card.find('h2')
                        link_elem = title_elem.find('a') if title_elem else card.find('a', href=True)
                        
                        job_title = link_elem.get_text(strip=True) if link_elem else 'Untitled Position'
                        apply_link = link_elem.get('href', '') if link_elem else ''

                        if not apply_link:
                            continue
                        
                        # Ensure link is absolute
                        if not apply_link.startswith('http'):
                            apply_link = "https://www.stagiaires.ma" + apply_link
                        
                        # 2. Company Name 
                        company_elem = card.find('span', class_=re.compile(r'company|entreprise'))
                        company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown Company'

                        # 3. Location - Fallback to the search location
                        location_scraped = location
                            
                        # 4. Description - using card text as snippet
                        description = card.get_text(strip=True)[:300] + '...' 

                        results.append({
                            'job_title': job_title,
                            'company_name': company_name,
                            'location': location_scraped,
                            'date_posted': 'Recently',
                            'employment_type': 'Internship',
                            'job_description': description,
                            'apply_link': apply_link,
                            'source_site': self.source_site
                        })
                        
                        page_parsed_count += 1
                        
                    except Exception:
                        # Continue to the next job card on parsing error
                        continue
                
                if page_parsed_count == 0:
                    break
                    
                current_page += 1
                time.sleep(random.uniform(2, 5)) 

            except requests.exceptions.RequestException as e:
                print(f"Network error fetching Stagiaires.ma results: {str(e)}")
                break 
            except Exception as e:
                print(f"Error fetching Stagiaires.ma results: {str(e)}")
                break

        return results