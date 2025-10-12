/*
  # Internship Aggregator Database Schema

  1. New Tables
    - internships table with job listings
    - scrape_logs table for tracking scraping runs

  2. Security
    - Enable RLS on both tables
    - Allow public read access to internships
    - Only service role can insert/update scrape data

  3. Indexes
    - Index on date_posted for sorting
    - Index on source_site for filtering
    - Index on job_title for search
    - Unique index on content_hash to prevent duplicates
*/

-- Create internships table
CREATE TABLE IF NOT EXISTS internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title text NOT NULL,
  company_name text NOT NULL,
  location text,
  date_posted timestamptz,
  employment_type text DEFAULT 'Internship',
  job_description text,
  apply_link text NOT NULL,
  source_site text NOT NULL,
  content_hash text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scrape_logs table
CREATE TABLE IF NOT EXISTS scrape_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_start timestamptz DEFAULT now(),
  scrape_end timestamptz,
  source_site text NOT NULL,
  records_found integer DEFAULT 0,
  status text DEFAULT 'running',
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_internships_date_posted ON internships(date_posted DESC);
CREATE INDEX IF NOT EXISTS idx_internships_source_site ON internships(source_site);
CREATE INDEX IF NOT EXISTS idx_internships_job_title ON internships(job_title);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships(created_at DESC);

-- Enable RLS
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- Public read access to internships (no auth required)
CREATE POLICY "Anyone can view internships"
  ON internships FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access to scrape logs
CREATE POLICY "Anyone can view scrape logs"
  ON scrape_logs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update internships
CREATE POLICY "Service role can insert internships"
  ON internships FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update internships"
  ON internships FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only service role can insert/update scrape logs
CREATE POLICY "Service role can insert scrape logs"
  ON scrape_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scrape logs"
  ON scrape_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);