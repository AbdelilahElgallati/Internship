-- 1. ENABLE THE REQUIRED EXTENSION FOR EFFICIENT TEXT SEARCHING
-- This fixes the error: "operator class "public.gin_trgm_ops" does not exist"
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. CREATE THE MAIN TABLE FOR INTERNSHIPS
CREATE TABLE public.internships (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT,
    employment_type TEXT DEFAULT 'Internship',
    job_description TEXT,
    apply_link TEXT,
    source_site TEXT NOT NULL,
    date_posted TIMESTAMPTZ,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    salary TEXT,
    content_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Full-text search vector for efficient keyword searching on title and description
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english', job_title || ' ' || job_description)) STORED
);

-- 3. ADD A UNIQUE CONSTRAINT TO THE HASH FOR AUTOMATIC DUPLICATE PREVENTION
-- This is more efficient than checking for duplicates in the application code.
ALTER TABLE public.internships ADD CONSTRAINT internships_content_hash_key UNIQUE (content_hash);

-- 4. CREATE INDEXES FOR FASTER QUERIES
-- Index for location search using the now-enabled pg_trgm extension
CREATE INDEX idx_internships_location ON public.internships USING gin (location gin_trgm_ops);

-- Index for filtering by source site
CREATE INDEX idx_internships_source ON public.internships (source_site);

-- Index for sorting by date
CREATE INDEX idx_internships_date_posted ON public.internships (date_posted DESC);

-- Index for the full-text search vector
CREATE INDEX idx_internships_fts ON public.internships USING gin(fts);


-- 5. CREATE THE TABLE FOR LOGGING SCRAPE SESSIONS
CREATE TABLE public.scrape_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    source_site TEXT NOT NULL,
    status TEXT NOT NULL,
    internships_found INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- 6. CREATE THE HIGH-PERFORMANCE STATISTICS FUNCTION
-- This runs aggregation queries directly on the database, which is highly scalable.
CREATE OR REPLACE FUNCTION get_internship_statistics()
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'total_internships', (SELECT COUNT(*) FROM public.internships),
            'by_source', (SELECT json_object_agg(source_site, count) FROM (SELECT source_site, COUNT(*) as count FROM public.internships GROUP BY source_site) as sources),
            'top_10_locations', (SELECT json_object_agg(location, count) FROM (SELECT location, COUNT(*) as count FROM public.internships WHERE location IS NOT NULL AND location != 'Remote' GROUP BY location ORDER BY count DESC LIMIT 10) as locations),
            'top_10_companies', (SELECT json_object_agg(company_name, count) FROM (SELECT company_name, COUNT(*) as count FROM public.internships GROUP BY company_name ORDER BY count DESC LIMIT 10) as companies)
        )
    );
END;
$$;