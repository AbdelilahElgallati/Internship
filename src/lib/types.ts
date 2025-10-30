export interface Internship {
  id: string;
  job_title: string | null;
  company_name: string | null;
  location: string | null;
  employment_type: string | null;
  job_description: string | null;
  apply_link: string;
  source_site: string;
  date_posted: string;
  salary: string | null;
  scraped_at: string;
  content_hash: string;
  created_at: string;
}

export interface Statistics {
  total_count: number;
  by_source: Array<{ source_site: string; count: number }>;
  top_locations: Array<{ location: string; count: number }>;
  top_companies: Array<{ company_name: string; count: number }>;
}

export interface StatisticsApiResponse {
  total_internships?: number;
  by_source?: { [key: string]: number };
  top_10_locations?: { [key: string]: number };
  top_10_companies?: { [key: string]: number };
  error?: string; 
}

export interface ScrapeLog {
  id: number;
  scrape_start: string;
  scrape_end: string;
  status: 'success' | 'failure';
  sites_scraped: string[];
  internships_found: number;
  new_internships: number;
  errors: string | null;
}