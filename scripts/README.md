# Data Pipeline Guide

This guide explains how to populate "The Git Bang" with real GitHub repository data using BigQuery + GitHub API.

## Architecture Overview

```
┌─────────────────┐
│   BigQuery      │  → Fetch 10K repos with minimal data (~$10)
│   (GH Archive)  │     - id, name, owner, language, stars, year
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  repositories   │  → Static JSON file (~800KB)
│      .json      │     - Loads once on app start
└────────┬────────┘     - Powers particle visualization
         │
         ↓
┌─────────────────┐
│   Three.js      │  → Render 25K particles
│  Visualization  │     - Color by language
└────────┬────────┘     - Size by stars
         │              - Position by year
         ↓
┌─────────────────┐
│  User clicks    │
│   particle      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  GitHub API     │  → Fetch details on-demand (FREE)
│  (On-demand)    │     - description, forks, metrics
└─────────────────┘     - Cached in memory

```

## Step-by-Step Instructions

### Option 1: BigQuery Only (Approximate Data)

**Cost:** ~$10-20
**Accuracy:** ~85%
**Best for:** Quick setup, good enough for visualization

1. **Run BigQuery Script**
   ```bash
   # Open BigQuery console
   open https://console.cloud.google.com/bigquery

   # Run the query in scripts/bigquery-fetch-repos.sql
   # Export results as JSON
   ```

2. **Convert BigQuery Results to JSON**
   ```javascript
   // BigQuery gives you an array of objects
   // Wrap it in the required format:
   {
     "repositories": [
       // ... paste BigQuery results here
     ]
   }
   ```

3. **Save to public/repositories.json**
   ```bash
   # Replace the existing file
   mv bigquery-results.json public/repositories.json
   ```

### Option 2: Hybrid Approach (Recommended)

**Cost:** $10-20 for BigQuery + FREE GitHub API
**Accuracy:** 100%
**Best for:** Production use

#### 2.1 Get Repository List from BigQuery

```bash
# Run the BigQuery query (see scripts/bigquery-fetch-repos.sql)
# This gives you ~10K repo names with approximate data
```

#### 2.2 Create a Node.js Script to Enrich with GitHub API

Create `scripts/enrich-with-github-api.js`:

```javascript
import fs from 'fs';

// Load BigQuery results
const bigqueryData = JSON.parse(fs.readFileSync('bigquery-results.json'));

// GitHub Personal Access Token (optional but recommended)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

async function fetchRepoDetails(owner, name) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${name}`,
      { headers }
    );

    if (!response.ok) {
      console.error(`Failed to fetch ${owner}/${name}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    return {
      id: `${owner}/${name}`,
      name,
      owner,
      language: data.language || 'Unknown',
      stars: data.stargazers_count,
      year: new Date(data.created_at).getFullYear(),
    };
  } catch (error) {
    console.error(`Error fetching ${owner}/${name}:`, error);
    return null;
  }
}

async function enrichData() {
  const repositories = [];
  const batchSize = 50; // Process in batches to respect rate limits

  for (let i = 0; i < bigqueryData.length; i += batchSize) {
    const batch = bigqueryData.slice(i, i + batchSize);

    console.log(`Processing batch ${i / batchSize + 1}...`);

    const results = await Promise.all(
      batch.map(repo => fetchRepoDetails(repo.owner, repo.name))
    );

    repositories.push(...results.filter(r => r !== null));

    // Rate limit: wait 1 second between batches (5000/hour = ~83/min)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save to repositories.json
  const output = {
    repositories: repositories.sort((a, b) => b.stars - a.stars)
  };

  fs.writeFileSync(
    'public/repositories.json',
    JSON.stringify(output, null, 2)
  );

  console.log(`✅ Saved ${repositories.length} repositories to public/repositories.json`);
}

enrichData();
```

#### 2.3 Run the Enrichment Script

```bash
# Set your GitHub token (optional, but increases rate limit)
export GITHUB_TOKEN=ghp_your_token_here

# Install dependencies
npm install

# Run the script
node scripts/enrich-with-github-api.js

# This will take ~2 hours for 10K repos with rate limiting
```

### Option 3: BigQuery Only with Minimal Data (Fastest)

**Cost:** ~$10
**Accuracy:** 85% (good enough)
**Setup time:** 10 minutes

Just use BigQuery data as-is! The hybrid approach we built will:
- Show approximate data immediately
- Fetch accurate details from GitHub API when user clicks a particle

No enrichment script needed!

## Data Format

### Minimal JSON (repositories.json)

```json
{
  "repositories": [
    {
      "id": "facebook/react",
      "name": "react",
      "owner": "facebook",
      "language": "JavaScript",
      "stars": 228000,
      "year": 2013
    }
  ]
}
```

Only 6 fields! This keeps the file size small (~800KB for 10K repos).

## Performance Targets

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| JSON file size | < 1MB | Use minimal 6-field structure |
| Initial load time | < 2s | Enable gzip on server |
| Particle count | 10K-25K | Adjust in code |
| Modal open time | < 500ms | GitHub API cached |

## Troubleshooting

### BigQuery query is too expensive

- Use monthly tables instead of yearly: `githubarchive.month.202401`
- Reduce years scanned: `_TABLE_SUFFIX BETWEEN '2020' AND '2024'`
- Test with sample first: `TABLESAMPLE SYSTEM (1 PERCENT)`

### GitHub API rate limit

- Create a Personal Access Token: https://github.com/settings/tokens
- Unauthenticated: 60 req/hour
- Authenticated: 5,000 req/hour

### File is too large

- Reduce repo count: Change `LIMIT 10000` to `LIMIT 5000`
- Enable gzip compression on your server
- Remove optional fields

## Cost Breakdown

| Component | Free Tier | Paid |
|-----------|-----------|------|
| BigQuery (one-time) | $10 free credit | ~$10-20 |
| GitHub API | 5,000 req/hour | FREE |
| Hosting JSON | Netlify/Vercel | FREE |
| **Total** | **FREE** | **~$10-20** |

## Next Steps

1. Run the BigQuery script
2. Save results to `public/repositories.json`
3. Deploy your app
4. When users click particles, they get live data from GitHub API!
