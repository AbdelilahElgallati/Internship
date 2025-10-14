import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import time
import random
from scrapers.base_scraper import BaseScraper


# ============================================================================
# 1. REMOTEOK - HAS PUBLIC API! (BEST OPTION)
# ============================================================================

class RemoteOKScraper(BaseScraper):
    """
    RemoteOK - Public API for remote jobs
    
    PROS:
    - Public API (no scraping needed!)
    - No rate limits
    - No authentication
    - JSON response
    - Perfect for remote internships
    
    CONS:
    - Only remote positions
    - Smaller database than Indeed
    
    Website: https://remoteok.com/
    API: https://remoteok.com/api
    """
    def __init__(self):
        super().__init__("RemoteOK")
        self.api_url = "https://remoteok.com/api"
        
    def scrape(self, keywords: List[str], locations: List[str] = None) -> List[Dict]:
        """
        Note: RemoteOK is remote-only, so locations are ignored
        """
        all_results = []
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        }
        
        print(f"\n🌍 Scraping RemoteOK API...")
        
        try:
            response = requests.get(self.api_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            jobs = response.json()
            
            # First item is metadata, skip it
            if jobs and isinstance(jobs, list):
                jobs = jobs[1:]
            
            print(f"✓ Fetched {len(jobs)} total jobs from RemoteOK")
            
            # Filter for internships and keywords
            for job in jobs:
                if self._matches_criteria(job, keywords):
                    all_results.append({
                        'job_title': job.get('position', 'N/A'),
                        'company_name': job.get('company', 'Unknown Company'),
                        'location': job.get('location', 'Remote'),
                        'date_posted': job.get('date', 'Recently'),
                        'employment_type': 'Internship',
                        'job_description': job.get('description', '')[:500],
                        'apply_link': job.get('url', ''),
                        'salary': job.get('salary_range', 'Not specified'),
                        'tags': ', '.join(job.get('tags', [])),
                        'source_site': self.source_site
                    })
            
            print(f"✅ Found {len(all_results)} matching internships on RemoteOK")
            
        except Exception as e:
            print(f"❌ RemoteOK API error: {str(e)}")
        
        return all_results
    
    def _matches_criteria(self, job: dict, keywords: List[str]) -> bool:
        """Check if job matches internship criteria"""
        position = job.get('position', '').lower()
        tags = [tag.lower() for tag in job.get('tags', [])]
        description = job.get('description', '').lower()
        
        # Must be internship
        is_internship = any(term in position or term in tags or term in description 
                           for term in ['intern', 'internship', 'trainee', 'graduate program'])
        
        if not is_internship:
            return False
        
        # Check if matches any keyword
        if keywords:
            keyword_match = any(
                keyword.lower() in position or 
                keyword.lower() in description or
                any(keyword.lower() in tag for tag in tags)
                for keyword in keywords
            )
            return keyword_match
        
        return True
