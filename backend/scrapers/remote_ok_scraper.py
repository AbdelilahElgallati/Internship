import requests
from typing import List, Dict
from bs4 import BeautifulSoup # <-- ADD THIS IMPORT
from scrapers.base_scraper import BaseScraper
from config import REMOTEOK_API_URL

class RemoteOKScraper(BaseScraper):
    def __init__(self):
        super().__init__("RemoteOK")
        self.api_url = REMOTEOK_API_URL
        
    def scrape(self, keywords: List[str], locations: List[str] = None) -> List[Dict]:
        print(f"\n🌍 [RemoteOK] Fetching jobs from API...")
        all_results = []
        try:
            response = requests.get(self.api_url, timeout=20)
            response.raise_for_status()
            
            jobs = response.json()
            if not jobs or not isinstance(jobs, list) or len(jobs) < 2:
                print("⚠️ [RemoteOK] API returned no job data.")
                return []
            
            jobs = jobs[1:]
            print(f"✓ [RemoteOK] Fetched {len(jobs)} total remote jobs.")

            for job in jobs:
                if self._matches_criteria(job, keywords):
                    all_results.append(self._format_job(job))
            
            print(f"✅ [RemoteOK] Found {len(all_results)} matching internships after filtering.")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ [RemoteOK] API request failed: {e}")
        
        return all_results
    
    def _matches_criteria(self, job: dict, keywords: List[str]) -> bool:
        text_to_check = (
            job.get('position', '') + ' ' + 
            job.get('description', '') + ' ' +
            ' '.join(job.get('tags', []))
        ).lower()

        internship_terms = ['intern', 'internship', 'trainee', 'stage']
        is_internship = any(term in text_to_check for term in internship_terms)
        
        if not is_internship:
            return False

        if keywords and not any(kw.lower() in text_to_check for kw in keywords):
            return False
            
        return True

    def _format_job(self, job: dict) -> Dict:
        """
        Formats the API response, now with HTML parsing for the description.
        """
        salary_min = job.get('salary_min', 0)
        salary_max = job.get('salary_max', 0)
        salary = f"${salary_min} - ${salary_max}" if salary_min > 0 else "Not specified"

        # --- FIX: Parse the HTML description ---
        raw_description = job.get('description', '')
        # Use BeautifulSoup to get clean text from the HTML block
        soup = BeautifulSoup(raw_description, 'html.parser')
        clean_description = soup.get_text(separator='\n', strip=True)
        # --- END FIX ---

        return {
            'job_title': job.get('position', 'N/A'),
            'company_name': job.get('company', 'N/A'),
            'location': 'Remote',
            'date_posted': job.get('date', 'Recently'),
            'employment_type': 'Internship',
            'job_description': clean_description, # <-- Use the cleaned description
            'apply_link': job.get('url', ''),
            'salary': salary,
            'source_site': self.source_site
        }