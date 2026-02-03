-- Supabase SQL to create views and functions for aggregated metrics
-- Run this in your Supabase SQL Editor

-- 1. Create a view for complete jobs (for reference)
CREATE OR REPLACE VIEW complete_jobs AS
SELECT *
FROM scraped_jobs
WHERE title IS NOT NULL
  AND client_location IS NOT NULL
  AND budget_amount IS NOT NULL;

-- 2. Function to get jobs over time metrics
CREATE OR REPLACE FUNCTION get_jobs_over_time()
RETURNS TABLE (
  date DATE,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*)::BIGINT as job_count
  FROM complete_jobs
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to get budget analysis metrics
CREATE OR REPLACE FUNCTION get_budget_analysis()
RETURNS TABLE (
  budget_range TEXT,
  job_count BIGINT,
  avg_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH budget_ranges AS (
    SELECT 
      CASE
        WHEN budget_amount ~ '^\$?[0-9]+$' THEN
          CASE
            WHEN CAST(REGEXP_REPLACE(budget_amount, '[^0-9]', '', 'g') AS NUMERIC) < 100 THEN '< $100'
            WHEN CAST(REGEXP_REPLACE(budget_amount, '[^0-9]', '', 'g') AS NUMERIC) < 500 THEN '$100-$500'
            WHEN CAST(REGEXP_REPLACE(budget_amount, '[^0-9]', '', 'g') AS NUMERIC) < 1000 THEN '$500-$1,000'
            WHEN CAST(REGEXP_REPLACE(budget_amount, '[^0-9]', '', 'g') AS NUMERIC) < 5000 THEN '$1,000-$5,000'
            ELSE '$5,000+'
          END
        WHEN budget_amount ~ '^\$?[0-9]+\s*-\s*\$?[0-9]+' THEN
          CASE
            WHEN CAST(REGEXP_REPLACE(SPLIT_PART(budget_amount, '-', 2), '[^0-9]', '', 'g') AS NUMERIC) < 500 THEN '< $500'
            WHEN CAST(REGEXP_REPLACE(SPLIT_PART(budget_amount, '-', 2), '[^0-9]', '', 'g') AS NUMERIC) < 1000 THEN '$500-$1,000'
            WHEN CAST(REGEXP_REPLACE(SPLIT_PART(budget_amount, '-', 2), '[^0-9]', '', 'g') AS NUMERIC) < 5000 THEN '$1,000-$5,000'
            ELSE '$5,000+'
          END
        ELSE 'Unknown'
      END as budget_range,
      budget_amount
    FROM complete_jobs
    WHERE budget_amount IS NOT NULL
  )
  SELECT 
    budget_range,
    COUNT(*)::BIGINT as job_count,
    AVG(CAST(REGEXP_REPLACE(budget_amount, '[^0-9]', '', 'g') AS NUMERIC)) as avg_budget
  FROM budget_ranges
  GROUP BY budget_range
  ORDER BY job_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get skills demand metrics
CREATE OR REPLACE FUNCTION get_skills_demand()
RETURNS TABLE (
  skill TEXT,
  demand_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH skills_expanded AS (
    SELECT 
      UNNEST(
        CASE 
          WHEN skills::text LIKE '[%' THEN 
            ARRAY(SELECT jsonb_array_elements_text(skills::jsonb))
          ELSE 
            ARRAY(SELECT TRIM(UNNEST(STRING_TO_ARRAY(skills::text, ','))))
        END
      ) as skill
    FROM complete_jobs
    WHERE skills IS NOT NULL
  )
  SELECT 
    TRIM(skill) as skill,
    COUNT(*)::BIGINT as demand_count
  FROM skills_expanded
  WHERE TRIM(skill) != ''
  GROUP BY TRIM(skill)
  ORDER BY demand_count DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get client countries metrics
CREATE OR REPLACE FUNCTION get_client_countries()
RETURNS TABLE (
  country TEXT,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    client_location as country,
    COUNT(*)::BIGINT as job_count
  FROM complete_jobs
  WHERE client_location IS NOT NULL
  GROUP BY client_location
  ORDER BY job_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get overall statistics
CREATE OR REPLACE FUNCTION get_overall_stats()
RETURNS TABLE (
  total_jobs BIGINT,
  total_complete_jobs BIGINT,
  avg_client_rating NUMERIC,
  total_client_spending TEXT,
  avg_hourly_rate NUMERIC,
  total_connects_required BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::BIGINT FROM scraped_jobs) as total_jobs,
    (SELECT COUNT(*)::BIGINT FROM complete_jobs) as total_complete_jobs,
    (SELECT AVG(client_rating) FROM complete_jobs WHERE client_rating IS NOT NULL) as avg_client_rating,
    (SELECT SUM(CAST(REGEXP_REPLACE(client_total_spent, '[^0-9]', '', 'g') AS NUMERIC))::TEXT 
     FROM complete_jobs 
     WHERE client_total_spent IS NOT NULL) as total_client_spending,
    (SELECT AVG(CAST(REGEXP_REPLACE(client_avg_hourly_rate, '[^0-9]', '', 'g') AS NUMERIC)) 
     FROM complete_jobs 
     WHERE client_avg_hourly_rate IS NOT NULL) as avg_hourly_rate,
    (SELECT SUM(CAST(REGEXP_REPLACE(connects_required, '[^0-9]', '', 'g') AS INTEGER))::BIGINT 
     FROM complete_jobs 
     WHERE connects_required IS NOT NULL) as total_connects_required;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get client activity metrics (for heatmap)
CREATE OR REPLACE FUNCTION get_client_activity()
RETURNS TABLE (
  date DATE,
  hour INTEGER,
  job_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    EXTRACT(HOUR FROM created_at)::INTEGER as hour,
    COUNT(*)::BIGINT as job_count
  FROM complete_jobs
  GROUP BY DATE(created_at), EXTRACT(HOUR FROM created_at)
  ORDER BY date DESC, hour;
END;
$$ LANGUAGE plpgsql;
