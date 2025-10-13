import time
import random
from typing import List, Dict
from playwright.sync_api import sync_playwright, Playwright, BrowserContext
from scrapers.base_scraper import BaseScraper 

class IndeedScraper(BaseScraper):
    def __init__(self):
        super().__init__("Indeed")
        self.base_url = "https://www.indeed.com/jobs"
        # We will no longer need user_agents as Playwright uses a real browser agent
        
    # Main scrape method is now synchronous (suitable for the scheduler thread)
    def scrape(self, keywords: List[str], locations: List[str]) -> List[Dict]:
        all_results = []
        
        # 1. Use sync_playwright context manager
        with sync_playwright() as p:
            # 2. Launch a browser (headless=True is faster and uses less memory)
            browser = p.chromium.launch(headless=True)
            
            # 3. Use a context (like a fresh session/incognito) for better isolation
            context = browser.new_context()
            
            for idx, keyword in enumerate(keywords):
                for loc_idx, location in enumerate(locations):
                    print(f"\n[{idx+1}/{len(keywords)}][{loc_idx+1}/{len(locations)}] Scraping Indeed (Playwright): '{keyword}' in '{location}'")
                    
                    try:
                        results = self._scrape_keyword(context, keyword, location)
                        all_results.extend(results)
                        
                        # Add a reasonable, random delay between searches
                        delay = random.uniform(5, 10) 
                        print(f"Waiting {delay:.1f}s before next request...")
                        time.sleep(delay)
                        
                    except Exception as e:
                        print(f"❌ Error scraping Indeed for '{keyword}' in '{location}': {str(e)}")
                        time.sleep(random.uniform(10, 15)) # Longer delay after error
                        continue

            # 4. Close browser resources
            browser.close()
            
        return all_results

    # Updated _scrape_keyword method to include better logging
    def _scrape_keyword(self, context: BrowserContext, keyword: str, location: str) -> List[Dict]:
        results = []
        page = context.new_page()
        
        # Build the URL with parameters
        params = {
            'q': keyword,
            'l': location,
            'sort': 'date',
            'fromage': '7',  # Last 7 days
        }
        # Indeed's URL structure is simpler to construct
        url = f"{self.base_url}?q={params['q']}&l={params['l']}&sort={params['sort']}&fromage={params['fromage']}"

        try:
            # Navigate to the page and wait until the network is mostly idle
            print(f"Navigating to: {url}")
            page.goto(url, wait_until="domcontentloaded", timeout=60000)

            # --- DEBUGGING STEP ADDED ---
            page_title = page.title()
            print(f"Page Title: {page_title}")
            
            # Check for a block page (e.g., reCAPTCHA or "403 Forbidden")
            if "Something went wrong" in page_title or page.locator("h1:has-text('Forbidden')").count() > 0:
                 print("⚠️ Indeed block page detected! Aborting scrape for this search.")
                 # You might need to add a reCAPTCHA solver here or use a proxy
                 page.close()
                 return results
            
            # Use Playwright's locator for more robust element selection
            job_cards = page.locator('.jobsearch-ResultsList > li[data-testid="jobsearch-viewjob-result"]')
            
            job_card_count = job_cards.count()
            if job_card_count == 0:
                print("⚠️ No job cards found by Playwright locator.")
                # You might need to update the selector: '[data-testid="jobsearch-viewjob-result"]'
                page.close()
                return results

            print(f"Found {job_card_count} job cards")

            # Iterate through the found elements
            for idx in range(min(job_card_count, 25)): # Limit to 25 per search
                try:
                    card = job_cards.nth(idx) # Get the specific card
                    
                    # Using locators with appropriate selectors. Removed explicit timeout=5000.
                    job_title = card.locator('h2[data-testid="job-title"]').inner_text()
                    
                    # Find the job link which contains the job key (jk)
                    link_locator = card.locator('a[data-testid="job-title"]').first
                    job_link = link_locator.get_attribute('href')
                    
                    # Extract job ID for the direct viewjob link
                    job_id = link_locator.get_attribute('data-jk') or ''

                    # Company and Location are often simple text locators
                    company_name = card.locator('div[data-testid="company-name"]').inner_text()
                    location_scraped = card.locator('div[data-testid="text-location"]').inner_text()
                    
                    # Description snippet - one of the most variable parts
                    description = card.locator('div.job-snippet').inner_text() if card.locator('div.job-snippet').count() else f"{job_title} at {company_name}"

                    # Date posted
                    date_posted = card.locator('span.date').inner_text() if card.locator('span.date').count() else 'Recently'

                    # Construct the final apply link
                    if job_id:
                        apply_link = f"https://www.indeed.com/viewjob?jk={job_id}"
                    elif job_link:
                        # Ensure the link is absolute
                        apply_link = job_link if job_link.startswith('http') else f"https://www.indeed.com{job_link}"
                    else:
                        apply_link = page.url # Fallback

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
                    
                    if (idx + 1) % 5 == 0:
                        print(f"  Parsed {idx + 1} jobs so far...")
                        
                except Exception as e:
                    print(f"⚠️ Error parsing job card #{idx}: {str(e)}")
                    continue
            
            print(f"✓ Successfully parsed {len(results)} jobs from Indeed")

        except Exception as e:
            print(f"❌ Playwright Navigation/Timeout Error: {str(e)}")
        finally:
            page.close() # Always close the page
            
        return results