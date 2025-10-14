import time
import random
from typing import List, Dict
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from urllib.parse import urlencode
from bs4 import BeautifulSoup

from scrapers.base_scraper import BaseScraper
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from config import INDEED_BASE_URL, INDEED_MAX_PAGES, INDEED_DAYS_AGO

class IndeedScraper(BaseScraper):
    def __init__(self):
        super().__init__("Indeed")
        self.base_url = INDEED_BASE_URL
        self.driver = None

    def init_driver(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')
        options.add_argument('--headless=new')

        print("🚀 [Indeed] Initializing Chrome driver...")
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.set_page_load_timeout(45)

    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []
        try:
            self.init_driver()
            for keyword in keywords:
                for location in locations:
                    print(f"\n🔍 [Indeed] Searching: '{keyword} internship' in '{location}'")
                    try:
                        results = self.scrape_jobs(f"{keyword} internship", location)
                        all_results.extend(results)
                        time.sleep(random.uniform(5, 10))
                    except Exception as e:
                        print(f"❌ [Indeed] Critical error searching '{keyword}' in '{location}': {e}")
                        # If a critical error occurs, re-init the driver
                        self.driver.quit()
                        self.init_driver()
                        continue
        finally:
            if self.driver:
                self.driver.quit()
        return all_results

    def handle_popups(self):
        """Handles common popups like cookie consent."""
        try:
            # Try to find and click a common cookie consent button
            close_button = WebDriverWait(self.driver, 3).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
            )
            close_button.click()
            print("✓ [Indeed] Handled cookie consent popup.")
            time.sleep(1)
        except TimeoutException:
            # No popup found, which is fine
            pass

    def scrape_jobs(self, keyword: str, location: str) -> List[Dict]:
        jobs = []
        for page in range(INDEED_MAX_PAGES):
            start = page * 10
            params = {'q': keyword, 'l': location, 'start': start, 'sort': 'date', 'fromage': INDEED_DAYS_AGO}
            url = f"{self.base_url}/jobs?{urlencode(params)}"
            print(f"📄 [Indeed] Scraping page {page + 1}: {url}")

            try:
                self.driver.get(url)
                
                # NEW: Wait for a more reliable element and handle popups
                WebDriverWait(self.driver, 25).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "jobsearch-ResultsList"))
                )
                self.handle_popups()

                if "did not match any jobs" in self.driver.page_source or "did not find any jobs" in self.driver.page_source:
                    print("⚠️ [Indeed] No results found for this query.")
                    break

                soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                job_cards = soup.select('li .cardOutline')
                
                if not job_cards:
                    print("⚠️ [Indeed] No job card selectors found on page.")
                    break

                print(f"✓ [Indeed] Found {len(job_cards)} job cards on page.")
                for card in job_cards:
                    job_data = self.extract_job_data(card)
                    if job_data:
                        jobs.append(job_data)
                
                time.sleep(random.uniform(3, 6))

            except TimeoutException:
                print("❌ [Indeed] Page failed to load or CAPTCHA detected. Skipping this search.")
                # You can optionally save a screenshot for debugging:
                # self.driver.save_screenshot(f"indeed_error_{keyword}_{location}.png")
                break
            except Exception as e:
                print(f"❌ [Indeed] Error processing page {page + 1}: {e}")
                break
        
        return jobs

    def extract_job_data(self, card) -> Dict:
        """Extracts job data from a BeautifulSoup job card."""
        try:
            title_elem = card.select_one('h2.jobTitle > a > span')
            job_title = title_elem.get_text(strip=True) if title_elem else 'N/A'

            # Filter non-internships early
            if 'intern' not in job_title.lower() and 'stage' not in job_title.lower():
                return None

            company_elem = card.select_one('[data-testid="company-name"]')
            company_name = company_elem.get_text(strip=True) if company_elem else 'N/A'

            location_elem = card.select_one('[data-testid="text-location"]')
            location = location_elem.get_text(strip=True) if location_elem else 'N/A'
            
            salary_elem = card.select_one('[data-testid="salary-snippet"]')
            salary = salary_elem.get_text(strip=True) if salary_elem else ""

            snippet_elem = card.select_one('.job-snippet')
            job_snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""

            link_elem = card.select_one('h2.jobTitle > a')
            apply_link = self.base_url + link_elem['href'] if link_elem and link_elem.get('href') else ""

            return {
                'job_title': job_title,
                'company_name': company_name,
                'location': location,
                'date_posted': 'Recently',
                'employment_type': 'Internship',
                'job_description': job_snippet,
                'apply_link': apply_link,
                'salary': salary,
                'source_site': self.source_site
            }
        except Exception:
            return None