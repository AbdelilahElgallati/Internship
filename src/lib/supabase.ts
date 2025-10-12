import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Internship {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  date_posted: string;
  employment_type: string;
  job_description: string;
  apply_link: string;
  source_site: string;
  created_at: string;
}

export interface ScrapeLog {
  id: string;
  scrape_start: string;
  scrape_end: string;
  source_site: string;
  records_found: number;
  status: string;
}
