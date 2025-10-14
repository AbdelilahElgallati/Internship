import time
import random
import pandas as pd
from typing import List, Dict
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from urllib.parse import urlencode
from scrapers.base_scraper import BaseScraper
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import requests


class IndeedScraper(BaseScraper):
    """
    Indeed scraper using Selenium with improved selectors and reliability
    Based on approach from: https://wasimmohammed.com/blog/indeed-scraper/
    """
    
    def __init__(self):
        super().__init__("Indeed")
        self.base_url = "https://www.indeed.com"
        self.driver = None
        
    def init_driver(self):
        """Initialize Chrome driver with proper configuration"""
        options = webdriver.ChromeOptions()
        
        # Stealth options to avoid detection
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Uncomment for headless mode if needed
        # options.add_argument('--headless=new')
        
        print("🚀 Initializing Chrome driver...")
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        
        # Mask selenium detection
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.set_page_load_timeout(30)
        self.driver.implicitly_wait(5)
        
        return self.driver

    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        """Main scraping method"""
        all_results = []
        
        try:
            self.init_driver()
            
            for keyword in keywords:
                for location in locations:
                    print(f"\n🔍 Searching: '{keyword}' in '{location}'")
                    
                    try:
                        results = self.scrape_jobs(keyword, location)
                        all_results.extend(results)
                        
                        # Random delay between searches
                        delay = random.uniform(3, 7)
                        print(f"⏳ Waiting {delay:.1f}s before next search...")
                        time.sleep(delay)
                        
                    except Exception as e:
                        print(f"❌ Error searching '{keyword}' in '{location}': {str(e)}")
                        time.sleep(random.uniform(10, 15))
                        continue
            
        except Exception as e:
            print(f"❌ Fatal error: {str(e)}")
        finally:
            if self.driver:
                self.driver.quit()
        
        return all_results
    
    def scrape_jobs(self, keyword: str, location: str, max_pages: int = 3) -> List[Dict]:
        """Scrape jobs for specific keyword and location with pagination"""
        jobs = []
        start = 0
        
        for page in range(max_pages):
            try:
                print(f"📄 Scraping page {page + 1}...")
                
                # Build URL with parameters
                params = {
                    'q': keyword,
                    'l': location,
                    'start': start,
                    'sort': 'date',
                    'fromage': '7'  # Last 7 days
                }
                
                url = f"{self.base_url}/jobs?{urlencode(params)}"
                print(f"🌐 Visiting: {url}")
                
                self.driver.get(url)
                time.sleep(random.uniform(2, 4))
                
                # Check for blocking
                if self.is_blocked():
                    print("🚫 Blocked by Indeed. Waiting...")
                    time.sleep(30)
                    continue
                
                # Check for no results
                if self.no_results():
                    print("⚠️ No results found")
                    break
                
                # Parse job cards
                page_jobs = self.parse_job_cards()
                jobs.extend(page_jobs)
                
                print(f"✅ Page {page + 1}: Found {len(page_jobs)} jobs")
                
                # Check if next page exists
                if not self.has_next_page():
                    print("⏹️ No more pages")
                    break
                
                # Increment for next page (Indeed uses 10, 20, 30...)
                start += 10
                
                # Random delay between pages
                time.sleep(random.uniform(2, 5))
                
            except Exception as e:
                print(f"❌ Error on page {page + 1}: {str(e)}")
                break
        
        print(f"🎯 Total found for '{keyword}' in '{location}': {len(jobs)} jobs")
        return jobs
    
    def parse_job_cards(self) -> List[Dict]:
        """Parse all job cards on current page"""
        jobs = []
        
        try:
            # Wait for job cards to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".job_seen_beacon"))
            )
            
            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Find job cards using reliable selectors
            job_cards = soup.select('.job_seen_beacon, .cardOutline, .tapItem')
            
            if not job_cards:
                print("⚠️ No job cards found")
                return jobs
            
            print(f"🔍 Found {len(job_cards)} job cards")
            
            for card in job_cards:
                try:
                    job_data = self.extract_job_data(card)
                    if job_data and self.is_internship(job_data):
                        jobs.append(job_data)
                    
                    # Small delay between processing cards
                    time.sleep(random.uniform(0.1, 0.3))
                    
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ Error parsing job cards: {str(e)}")
        
        return jobs
    
    def extract_job_data(self, card) -> Dict:
        """Extract job data from a job card using BeautifulSoup"""
        try:
            # Job ID
            job_id = card.get('data-jk', '') or card.get('id', '')
            if not job_id:
                return None
            
            # Job Title
            title_elem = card.select_one('h2.jobTitle span[title], h2.jobTitle a, .jobTitle span')
            job_title = title_elem.get_text(strip=True) if title_elem else ""
            
            if not job_title:
                return None
            
            # Company Name
            company_elem = card.select_one('.companyName, [data-testid="company-name"]')
            company_name = company_elem.get_text(strip=True) if company_elem else "Unknown Company"
            
            # Company Location
            location_elem = card.select_one('.companyLocation, [data-testid="text-location"]')
            location = location_elem.get_text(strip=True) if location_elem else ""
            
            # Salary
            salary_elem = card.select_one('.salary-snippet-container, .estimated-salary, .salaryOnly')
            salary = salary_elem.get_text(strip=True) if salary_elem else ""
            
            # Job Snippet
            snippet_elem = card.select_one('.job-snippet, .summary')
            job_snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
            
            # Job Link
            link_elem = card.select_one('a[href*="/viewjob"], a[href*="/rc/clk"], h2.jobTitle a')
            apply_link = ""
            if link_elem and link_elem.get('href'):
                href = link_elem['href']
                if href.startswith('/'):
                    apply_link = f"{self.base_url}{href}"
                else:
                    apply_link = href
            
            # Date Posted
            date_elem = card.select_one('.date, .result-link-bar-container')
            date_posted = date_elem.get_text(strip=True) if date_elem else "Recently"
            
            # Employment Type detection
            employment_type = self.detect_employment_type(job_title, job_snippet)
            
            return {
                'job_id': job_id,
                'job_title': job_title,
                'company_name': company_name,
                'location': location,
                'salary': salary,
                'date_posted': date_posted,
                'employment_type': employment_type,
                'job_description': job_snippet,
                'apply_link': apply_link,
                'source_site': self.source_site,
                'scraped_at': pd.Timestamp.now()
            }
            
        except Exception as e:
            print(f"❌ Error extracting job data: {str(e)}")
            return None
    
    def is_blocked(self) -> bool:
        """Check if we're blocked by Indeed"""
        try:
            page_source = self.driver.page_source.lower()
            blocked_indicators = [
                'captcha',
                'access denied',
                'blocked',
                'security check',
                'unusual traffic',
                'bot'
            ]
            
            return any(indicator in page_source for indicator in blocked_indicators)
        except:
            return False
    
    def no_results(self) -> bool:
        """Check if no results are found"""
        try:
            no_results_selectors = [
                '.no_results',
                '.noResults',
                '[data-testid="no-results"]'
            ]
            
            for selector in no_results_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements and "no results" in elements[0].text.lower():
                    return True
            return False
        except:
            return False
    
    def has_next_page(self) -> bool:
        """Check if next page exists"""
        try:
            next_buttons = self.driver.find_elements(
                By.CSS_SELECTOR, 
                'a[data-testid="pagination-page-next"], a[aria-label="Next Page"]'
            )
            return len(next_buttons) > 0 and next_buttons[0].is_enabled()
        except:
            return False
    
    def detect_employment_type(self, title: str, description: str) -> str:
        """Detect employment type from title and description"""
        text = f"{title} {description}".lower()
        
        type_mapping = {
            'Internship': ['intern', 'internship', 'stage'],
            'Full-time': ['full-time', 'full time', 'ft'],
            'Part-time': ['part-time', 'part time', 'pt'],
            'Contract': ['contract', 'freelance', 'consultant']
        }
        
        for emp_type, keywords in type_mapping.items():
            if any(keyword in text for keyword in keywords):
                return emp_type
        
        return 'Not specified'
    
    def is_internship(self, job_data: Dict) -> bool:
        """Check if job is an internship"""
        if not job_data:
            return False
            
        text = f"{job_data['job_title']} {job_data['job_description']}".lower()
        internship_keywords = ['intern', 'internship', 'stage', 'trainee']
        
        return any(keyword in text for keyword in internship_keywords)

    def get_job_details(self, job_url: str) -> Dict:
        """Get detailed job description (optional enhancement)"""
        try:
            self.driver.get(job_url)
            time.sleep(2)
            
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Extract full description
            description_elem = soup.select_one('#jobDescriptionText, .jobsearch-JobComponent-description')
            full_description = description_elem.get_text(strip=True) if description_elem else ""
            
            return {
                'full_description': full_description,
                'job_url': job_url
            }
        except Exception as e:
            print(f"❌ Error getting job details: {str(e)}")
            return {}