import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from scrapers.base_scraper import BaseScraper
import time
import random

class WelcomeToTheJungleScraper(BaseScraper):
    def __init__(self):
        super().__init__("WelcomeToTheJungle")
        # Base URL structure for 'stages' (internships) in France/Europe
        self.base_url = "https://www.welcometothejungle.com/fr/jobs"
        # The WTTJ URL uses query parameters for search terms.
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        ]
        self.JOBS_PER_PAGE = 30 # Default WTTJ limit
        self.MAX_PAGES = 5      # Limit to 5 pages (150 jobs) per search pair

    def _get_headers(self):
        """Génère des headers aléatoires pour éviter le blocage"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
            'Connection': 'keep-alive',
            'DNT': '1'
        }

    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []
        for keyword in keywords:
            for location in locations:
                try:
                    results = self._scrape_keyword(keyword, location)
                    all_results.extend(results)
                    # Delay between searches
                    time.sleep(random.uniform(3, 7))
                except Exception as e:
                    print(f"Error scraping WTTJ for '{keyword}' in '{location}': {str(e)}")
                    continue
        return all_results

    def _scrape_keyword(self, keyword: str, location: str) -> List[Dict]:
        results = []
        # parsed_count variable removed, replaced by direct use of len(results)
        current_page = 1
        page_parsed_count = 0 # FIX 1: Initialize here to prevent NameError if request fails early
        
        # WTTJ is highly dynamic; filtering is best done through URL parameters
        # However, building a URL that accepts all your complex keywords is hard.
        # We simplify the search query for robustness.
        simple_keyword = keyword.split(' ')[0] # Use only the first word as main query
        
        while current_page <= self.MAX_PAGES:
            params = {
                'page': current_page,
                'query': simple_keyword,
                # WTTJ uses a specific format for contract type and location
                'contract_type[]': 'internship', # Focus on internships
                'sortBy': 'published_at_desc', # Sort by date
                # Location filter is applied in the URL path for better results on WTTJ
                # But for simplicity, we use the query parameter and hope the search engine handles it
                'aroundQuery': location 
            }
            
            # Remove None values
            params = {k: v for k, v in params.items() if v is not None}
            
            try:
                print(f"-> Scraping WTTJ page {current_page} for '{simple_keyword}' in '{location}'")
                
                response = requests.get(
                    self.base_url,
                    params=params,
                    headers=self._get_headers(),
                    timeout=15
                )
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')

                # WTTJ often uses job-card or card components
                # Find the main container for job listings (this selector is prone to breaking)
                # Using a generic attribute selector for stability
                job_cards = soup.find_all('div', {'data-testid': 'job-card'})

                if not job_cards:
                    print(f"No job cards found on page {current_page}. Stopping pagination.")
                    break

                page_parsed_count = 0
                for card in job_cards:
                    try:
                        # 1. Title and Link are often in an <a> tag
                        title_link_elem = card.find('a', {'data-testid': 'job-card-title'})
                        job_title = title_link_elem.get_text(strip=True) if title_link_elem else 'Untitled Position'
                        apply_link = "https://www.welcometothejungle.com" + title_link_elem.get('href', '') if title_link_elem else ''

                        if not apply_link:
                            continue

                        # 2. Company Name
                        company_elem = card.find('span', {'data-testid': 'company-card-title'})
                        company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown Company'

                        # 3. Location and Date are harder to pinpoint, often grouped in the meta
                        # We use a broad selector and clean the text
                        meta_info = card.find_all('span', class_='sc-fgrSAo') # Common wrapper for meta data
                        location_scraped = meta_info[0].get_text(strip=True) if meta_info and len(meta_info) > 0 else location
                        date_posted = 'Recently' # WTTJ date format is complex, setting as default

                        # 4. Description snippet (optional)
                        snippet_elem = card.find('p', class_='sc-bZkYLs') # A common text snippet class
                        description = snippet_elem.get_text(strip=True) if snippet_elem else f"{job_title} at {company_name}"

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
                        
                        page_parsed_count += 1
                        
                    except Exception as e:
                        # Log parsing errors but continue with other cards
                        # print(f"Error parsing WTTJ job card: {str(e)}")
                        continue
                
                print(f"Parsed {page_parsed_count} jobs from WTTJ on page {current_page}")
                
                if page_parsed_count == 0 and current_page > 1:
                    break
                    
                current_page += 1
                time.sleep(random.uniform(2, 5)) # Delay between pages

            except requests.exceptions.RequestException as e:
                print(f"Network error fetching WTTJ results for '{keyword}' in '{location}' (page {current_page}): {str(e)}")
                time.sleep(random.uniform(5, 10))
                break # Stop this search on network error
            except Exception as e:
                print(f"Error fetching WTTJ results for '{keyword}' in '{location}' (page {current_page}): {str(e)}")
                break

        # FIX 2: Use len(results) for the correct total
        print(f"Finished scraping '{keyword}' in '{location}'. Total jobs parsed: {len(results)}")
        return results