import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Internship {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  employment_type: string;
  job_description: string;
  apply_link: string;
  source_site: string;
  date_posted: string;
  salary: string;
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
