# import requests
# from bs4 import BeautifulSoup
# from typing import List, Dict
# from scrapers.base_scraper import BaseScraper
# import time
# import random

# class LinkedInScraper(BaseScraper):
#     def __init__(self):
#         super().__init__("LinkedIn")
#         self.base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
#         self.user_agents = [
#             'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
#             'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
#             'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
#         ]

#     def _get_headers(self):
#         """Génère des headers aléatoires"""
#         return {
#             'User-Agent': random.choice(self.user_agents),
#             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
#             'Accept-Language': 'en-US,en;q=0.9',
#             'Accept-Encoding': 'gzip, deflate, br',
#             'Referer': 'https://www.linkedin.com/jobs/search',
#             'DNT': '1',
#             'Connection': 'keep-alive',
#         }

#     # Updated scrape method signature
#     def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
#         all_results = []

#         # Nested loop: keyword * location
#         for keyword in keywords:
#             for location in locations:
#                 try:
#                     # Pass the specific location to the scraping function
#                     results = self._scrape_keyword(keyword, location)
#                     all_results.extend(results)
#                     # Délai aléatoire entre 3 et 6 secondes
#                     time.sleep(random.uniform(3, 6))
#                 except Exception as e:
#                     # Updated print message to include location
#                     print(f"Error scraping LinkedIn for '{keyword}' in '{location}': {str(e)}")
#                     continue

#         return all_results

#     # Updated _scrape_keyword method signature
#     def _scrape_keyword(self, keyword: str, location: str) -> List[Dict]:
#         results = []

#         params = {
#             'keywords': keyword,
#             'location': location, # Use the passed location parameter
#             'f_TPR': 'r86400',  # Dernières 24h
#             'f_JT': 'I',  # Internship
#             'start': 0,
#             'sortBy': 'DD'  # Date descending
#         }

#         try:
#             session = requests.Session()
            
#             response = session.get(
#                 self.base_url, 
#                 params=params, 
#                 headers=self._get_headers(), 
#                 timeout=15,
#                 allow_redirects=True
#             )
#             response.raise_for_status()

#             soup = BeautifulSoup(response.content, 'html.parser')

#             # LinkedIn utilise des <li> pour les job cards
#             job_cards = soup.find_all('li')

#             parsed_count = 0
#             for card in job_cards:
#                 if parsed_count >= 20:  # Limiter à 20 résultats par keyword + location
#                     break
                    
#                 try:
#                     # Titre du poste
#                     title_elem = card.find('h3', class_='base-search-card__title')
#                     if not title_elem:
#                         continue

#                     job_title = title_elem.get_text(strip=True)
                    
#                     # Vérifier que c'est bien un stage
#                     if 'intern' not in job_title.lower() and 'stage' not in job_title.lower():
#                         # Si le keyword contient "intern", on garde quand même
#                         if 'intern' not in keyword.lower():
#                             continue

#                     # Company
#                     company_elem = card.find('h4', class_='base-search-card__subtitle') or \
#                                   card.find('a', class_='hidden-nested-link')
#                     company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown'

#                     # Location
#                     location_elem = card.find('span', class_='job-search-card__location')
#                     location_scraped = location_elem.get_text(strip=True) if location_elem else 'Remote'

#                     # Link
#                     link_elem = card.find('a', class_='base-card__full-link')
#                     apply_link = link_elem.get('href', '') if link_elem else ''

#                     if not apply_link:
#                         continue

#                     # Nettoyer le lien (enlever les paramètres de tracking)
#                     if '?' in apply_link:
#                         apply_link = apply_link.split('?')[0]

#                     # Date
#                     date_elem = card.find('time', class_='job-search-card__listdate')
#                     if date_elem:
#                         date_posted = date_elem.get('datetime', '') or date_elem.get_text(strip=True)
#                     else:
#                         date_posted = 'Recently'

#                     # Description (optionnelle sur la page de liste)
#                     description_elem = card.find('p', class_='job-search-card__snippet')
#                     description = description_elem.get_text(strip=True) if description_elem else f"{job_title} at {company_name}"

#                     results.append({
#                         'job_title': job_title,
#                         'company_name': company_name,
#                         'location': location_scraped,
#                         'date_posted': date_posted,
#                         'employment_type': 'Internship',
#                         'job_description': description,
#                         'apply_link': apply_link,
#                         'source_site': self.source_site
#                     })
                    
#                     parsed_count += 1

#                 except Exception as e:
#                     # Updated print message to include location
#                     print(f"Error parsing LinkedIn job card for '{keyword}' in '{location}': {str(e)}")
#                     continue

#             # Added print to show results per keyword/location pair
#             print(f"Parsed {parsed_count} jobs from LinkedIn for '{keyword}' in '{location}'")

#         except requests.exceptions.RequestException as e:
#             # Updated print message to include location
#             print(f"Network error fetching LinkedIn results for '{keyword}' in '{location}': {str(e)}")
#         except Exception as e:
#             # Updated print message to include location
#             print(f"Error fetching LinkedIn results for '{keyword}' in '{location}': {str(e)}")

#         return results

#     def get_job_details(self, job_url: str) -> Dict:
#         """
#         Récupère les détails complets d'une offre (optionnel - pour enrichir les données)
#         """
#         try:
#             response = requests.get(job_url, headers=self._get_headers(), timeout=10)
#             response.raise_for_status()
            
#             soup = BeautifulSoup(response.content, 'html.parser')
            
#             description_elem = soup.find('div', class_='show-more-less-html__markup')
#             if description_elem:
#                 return {'full_description': description_elem.get_text(strip=True)}
            
#         except Exception as e:
#             print(f"Error fetching job details: {str(e)}")
        
#         return {}

import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from scrapers.base_scraper import BaseScraper # Assuming BaseScraper exists
import time
import random

class LinkedInScraper(BaseScraper):
    def __init__(self):
        super().__init__("LinkedIn")
        self.base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        ]
        self.JOBS_PER_PAGE = 25
        self.MAX_PAGES = 10 # Limit to 10 pages (250 jobs) to avoid being blocked quickly

    def _get_headers(self):
        """Génère des headers aléatoires"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.linkedin.com/jobs/search',
            'DNT': '1',
            'Connection': 'keep-alive',
        }

    # The scrape method remains the same, looping through keywords and locations
    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []

        for keyword in keywords:
            for location in locations:
                try:
                    # Pass the specific location to the scraping function
                    results = self._scrape_keyword(keyword, location)
                    all_results.extend(results)
                    # Increased random delay between keyword/location pairs
                    time.sleep(random.uniform(5, 10))
                except Exception as e:
                    print(f"Error scraping LinkedIn for '{keyword}' in '{location}': {str(e)}")
                    continue

        return all_results

    # Updated _scrape_keyword method to include PAGINATION
    def _scrape_keyword(self, keyword: str, location: str) -> List[Dict]:
        results = []
        parsed_count = 0
        current_page = 0
        session = requests.Session() # Use a single session

        while current_page < self.MAX_PAGES:
            start_offset = current_page * self.JOBS_PER_PAGE
            
            params = {
                'keywords': keyword,
                'location': location,
                # 'f_TPR': 'r604800',  # Dernière semaine
                # 'f_JT': 'I',  # Internship
                'start': start_offset,
                'sortBy': 'DD'  # Date descending
            }

            try:
                print(f"-> Scraping page {current_page + 1} for '{keyword}' in '{location}' (start={start_offset})")
                
                response = session.get(
                    self.base_url, 
                    params=params, 
                    headers=self._get_headers(), 
                    timeout=15,
                    allow_redirects=True
                )
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')
                job_cards = soup.find_all('li')

                if not job_cards:
                    print(f"No more job cards found on page {current_page + 1}. Stopping pagination.")
                    break # Stop if no jobs are found on a page

                page_parsed_count = 0
                for card in job_cards:
                    try:
                        # --- Job Card Parsing ---
                        title_elem = card.find('h3', class_='base-search-card__title')
                        if not title_elem:
                            continue

                        job_title = title_elem.get_text(strip=True)
                        
                        # Use a broad check since keyword is now broad
                        if 'intern' not in job_title.lower() and 'stage' not in job_title.lower():
                            # If the keyword is broad, still ensure the title is an internship
                            if 'intern' not in keyword.lower(): # Only skip if keyword wasn't broad
                                continue

                        company_elem = card.find('h4', class_='base-search-card__subtitle') or \
                                      card.find('a', class_='hidden-nested-link')
                        company_name = company_elem.get_text(strip=True) if company_elem else 'Unknown'

                        location_elem = card.find('span', class_='job-search-card__location')
                        location_scraped = location_elem.get_text(strip=True) if location_elem else 'Remote'

                        link_elem = card.find('a', class_='base-card__full-link')
                        apply_link = link_elem.get('href', '') if link_elem else ''

                        if not apply_link:
                            continue

                        if '?' in apply_link:
                            apply_link = apply_link.split('?')[0]

                        date_elem = card.find('time', class_='job-search-card__listdate')
                        date_posted = date_elem.get('datetime', '') if date_elem else 'Recently'

                        # Description from list page (will be overwritten by detail scrape)
                        description_elem = card.find('p', class_='job-search-card__snippet')
                        snippet_description = description_elem.get_text(strip=True) if description_elem else f"{job_title} at {company_name}"

                        job_data = {
                            'job_title': job_title,
                            'company_name': company_name,
                            'location': location_scraped,
                            'date_posted': date_posted,
                            'employment_type': 'Internship',
                            'job_description': snippet_description,
                            'apply_link': apply_link,
                            'source_site': self.source_site
                        }
                        
                        # NEW: Fetch job details for the full description (Two-step scrape like Scrapy)
                        full_details = self.get_job_details(apply_link)
                        job_data.update(full_details) # Add 'full_description' if available

                        results.append(job_data)
                        
                        page_parsed_count += 1
                        
                    except Exception as e:
                        print(f"Error parsing LinkedIn job card for '{keyword}' in '{location}' (page {current_page + 1}): {str(e)}")
                        continue
                
                print(f"Parsed {page_parsed_count} jobs from LinkedIn for '{keyword}' in '{location}' on page {current_page + 1}")
                
                # Update counters for next iteration
                parsed_count += page_parsed_count
                current_page += 1
                
                # Check for rate limit or empty page before next request
                if page_parsed_count == 0 and current_page > 0:
                    break # Stop if a page returns no results
                    
                # Delay between pages (essential for safe scraping)
                time.sleep(random.uniform(5, 10))

            except requests.exceptions.RequestException as e:
                print(f"Network error fetching LinkedIn results for '{keyword}' in '{location}' (page {current_page + 1}): {str(e)}")
                # Consider adding a longer sleep/retry logic here
                time.sleep(random.uniform(10, 20))
                current_page += 1 # Move to next page attempt to avoid re-hitting a bad page
                continue
            except Exception as e:
                print(f"Error fetching LinkedIn results for '{keyword}' in '{location}' (page {current_page + 1}): {str(e)}")
                current_page += 1
                continue

        print(f"Finished scraping '{keyword}' in '{location}'. Total jobs parsed: {parsed_count}")
        return results

    def get_job_details(self, job_url: str) -> Dict:
        """
        Récupère les détails complets d'une offre (to match Scrapy's two-step scrape)
        """
        try:
            # Note: We use a short timeout here as this is a secondary request for detail
            response = requests.get(job_url, headers=self._get_headers(), timeout=7) 
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Match selectors from Linkedin_scrapping.py for full description
            description_elem = soup.find('div', class_='show-more-less-html__markup') or \
                               soup.find('div', class_='jobs-description-content__text')

            if description_elem:
                full_description_text = description_elem.get_text(strip=True)
                return {'job_description': full_description_text} # Overwrite snippet with full description
            
        except Exception as e:
            # We don't crash the scrape, just log the error and return empty details
            print(f"Error fetching job details for {job_url}: {str(e)}")
        
        return {} # Return empty dict if details fail to be fetched