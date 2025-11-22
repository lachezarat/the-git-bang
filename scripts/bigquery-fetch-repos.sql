-- BigQuery Script to Fetch GitHub Repositories with 1000+ Stars
-- This query extracts minimal data needed for "The Git Bang" visualization
--
-- Instructions:
-- 1. Go to https://console.cloud.google.com/bigquery
-- 2. Paste this query
-- 3. Run it (cost should be ~$5-20 depending on data scanned)
-- 4. Export results as JSON
-- 5. Format as needed for repositories.json

WITH repo_events AS (
  -- Aggregate events per repository across all years
  SELECT
    repo.name as full_name,

    -- Extract owner and name from "owner/repo" format
    SPLIT(repo.name, '/')[OFFSET(0)] as owner,
    SPLIT(repo.name, '/')[OFFSET(1)] as name,

    -- Count stars (WatchEvent = someone starred the repo)
    COUNTIF(type = 'WatchEvent') as stars,

    -- Get the earliest year this repo appeared in GH Archive
    MIN(EXTRACT(YEAR FROM created_at)) as year,

    -- Try to extract language from event payloads
    -- PushEvents sometimes contain repository metadata
    APPROX_TOP_COUNT(JSON_EXTRACT_SCALAR(payload, '$.repository.language'), 1)[OFFSET(0)].value as language

  FROM
    `githubarchive.year.*`
  WHERE
    -- Scan data from 2008 to 2024 (adjust as needed)
    _TABLE_SUFFIX BETWEEN '2008' AND '2024'

    -- Only process relevant event types to reduce cost
    AND type IN ('WatchEvent', 'PushEvent')

    -- Filter out null repo names
    AND repo.name IS NOT NULL

  GROUP BY
    repo.name

  HAVING
    -- Only repos with 1000+ stars
    stars >= 1000
),

ranked_repos AS (
  SELECT
    *,
    -- Rank by stars to get top repos
    ROW_NUMBER() OVER (ORDER BY stars DESC) as rank
  FROM
    repo_events
)

-- Final output
SELECT
  -- Use full_name as ID (e.g., "facebook/react")
  full_name as id,
  name,
  owner,

  -- Language (may be null for some repos)
  COALESCE(language, 'Unknown') as language,

  stars,
  year

FROM
  ranked_repos
WHERE
  -- Limit to top 10,000 repos (adjust as needed)
  rank <= 10000

ORDER BY
  stars DESC;

-- ALTERNATIVE: More Accurate Language Detection
-- If the above doesn't get good language data, try this enhanced version:

/*
WITH repo_push_events AS (
  SELECT
    repo.name as full_name,
    SPLIT(repo.name, '/')[OFFSET(0)] as owner,
    SPLIT(repo.name, '/')[OFFSET(1)] as name,
    JSON_EXTRACT_SCALAR(payload, '$.repository.language') as language,
    EXTRACT(YEAR FROM created_at) as year
  FROM
    `githubarchive.month.202401`  -- Use recent month for language data
  WHERE
    type = 'PushEvent'
    AND JSON_EXTRACT_SCALAR(payload, '$.repository.language') IS NOT NULL
),

repo_stars AS (
  SELECT
    repo.name as full_name,
    COUNTIF(type = 'WatchEvent') as stars
  FROM
    `githubarchive.year.*`
  WHERE
    _TABLE_SUFFIX BETWEEN '2008' AND '2024'
    AND type = 'WatchEvent'
  GROUP BY
    repo.name
  HAVING
    stars >= 1000
)

SELECT
  s.full_name as id,
  SPLIT(s.full_name, '/')[OFFSET(1)] as name,
  SPLIT(s.full_name, '/')[OFFSET(0)] as owner,
  COALESCE(p.language, 'Unknown') as language,
  s.stars,
  MIN(p.year) as year
FROM
  repo_stars s
LEFT JOIN
  repo_push_events p ON s.full_name = p.full_name
GROUP BY
  s.full_name, p.language, s.stars
ORDER BY
  s.stars DESC
LIMIT 10000;
*/

-- COST ESTIMATION:
-- Scanning ~5TB of data = ~$25
-- To reduce cost:
-- 1. Use monthly tables instead of year tables (cheaper)
-- 2. Limit years scanned
-- 3. Add more WHERE filters
-- 4. Use TABLESAMPLE to test query first

-- EXAMPLE: Test with sample data first (much cheaper)
/*
SELECT *
FROM repo_events
TABLESAMPLE SYSTEM (1 PERCENT)  -- Only scan 1% of data
LIMIT 100;
*/
