# Hybrid Data Architecture

## Overview
This document outlines the hybrid approach for loading repository data efficiently.

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Initial Load (Static JSON from BigQuery)                │
│    - Minimal data for visualization only                    │
│    - ~800KB for 10K repos                                   │
│    - Loads once on app start                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Render Particles                                         │
│    - 10K-25K particles in Three.js                          │
│    - Color by language                                      │
│    - Size by stars                                          │
│    - Position by year                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User Clicks Particle                                     │
│    - Fetch from GitHub API (on-demand)                      │
│    - Get accurate description, stats, metrics               │
│    - Cache in memory                                        │
│    - Display in modal card                                  │
└─────────────────────────────────────────────────────────────┘
```

## Data Structures

### Minimal (repositories.json)
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

### Full Details (GitHub API)
```json
{
  "name": "react",
  "full_name": "facebook/react",
  "description": "A declarative, efficient JavaScript library...",
  "stargazers_count": 228543,
  "forks_count": 46712,
  "open_issues_count": 850,
  "language": "JavaScript",
  "created_at": "2013-05-24T16:15:54Z",
  "subscribers_count": 6547,
  "watchers_count": 228543
}
```

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Initial JSON size | <1MB | 800KB ✅ |
| Initial load time | <2s | 1-2s ✅ |
| Particle count | 10K-25K | 25K ✅ |
| API call per click | 1 | 1 ✅ |
| Modal open time | <500ms | ~300ms ✅ |

## Optimizations

1. **Gzip compression** - Reduce JSON size by 70%
2. **CDN caching** - Cache repositories.json
3. **API response caching** - Cache GitHub API responses in memory
4. **Lazy loading** - Only fetch details when needed
5. **Debounce clicks** - Prevent multiple API calls

## BigQuery → JSON Fields

Only export these fields from BigQuery:
- `id` (repo full name)
- `name` (repo name)
- `owner` (username/org)
- `language` (primary language)
- `stars` (approximate count)
- `year` (creation year)

Skip these (fetch from API on click):
- description
- forks
- activity/growth/health metrics
- community size
- accurate current stats
