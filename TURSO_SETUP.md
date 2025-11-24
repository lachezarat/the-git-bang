# Turso Database Setup Guide

## Overview

This project uses [Turso](https://turso.tech/) - a distributed SQLite database - to serve repository details via the `/api/repo/:owner/:name` endpoint. Turso allows SQLite to work seamlessly in serverless environments like Netlify.

## Local Setup (Already Completed)

The following steps have been completed for local development:

1. ✅ Installed Turso CLI
2. ✅ Created Turso account (username: lachezarat)
3. ✅ Created database: `the-git-bang`
4. ✅ Migrated 55,414 repositories from local SQLite to Turso
5. ✅ Updated server code to use `@libsql/client`
6. ✅ Added environment variables to `.env`

## Database Information

- **Database Name**: `the-git-bang`
- **URL**: `libsql://the-git-bang-lachezarat.aws-eu-west-1.turso.io`
- **Location**: AWS EU West 1 (Ireland)
- **Row Count**: 55,414 repositories

## Environment Variables

The following environment variables are configured in `.env`:


## Netlify Deployment Setup

To deploy to Netlify with Turso support:

### 1. Add Environment Variables in Netlify

Go to your Netlify site settings and add these environment variables:

1. Navigate to: **Site settings** → **Environment variables**
2. Click **Add a variable** and add:

   ```
   TURSO_DATABASE_URL
   libsql://the-git-bang-lachezarat.aws-eu-west-1.turso.io
   ```

3. Click **Add a variable** and add:

   ```
   TURSO_AUTH_TOKEN
   eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM5OTIyNjgsImlkIjoiMDQ0NTg3NGEtMmJmYi00M2VjLThlMmQtOWE4ZWFkZDc2MGJkIiwicmlkIjoiMGRjYzFiNTctZjJiNi00YjM5LTlhMjMtMTI1ZTllNjlmYzU3In0.MYQpNahbSo9hb3Q8OnVwhLtjeeJ-9_xwEv21gk7OvNLYCvGVrs3L-doNEzF3wEXhLthoKgRkpjNPWL1Z_fzZAg
   ```

4. Make sure to set these for **All scopes** (Production, Deploy Previews, Branch Deploys)

### 2. Redeploy Your Site

After adding the environment variables:

```bash
# Option 1: Trigger redeploy from Netlify UI
# Go to Deploys → Trigger deploy → Deploy site

# Option 2: Push a new commit
git add .
git commit -m "Add Turso database integration"
git push origin main
```

### 3. Verify Deployment

Test the API endpoint after deployment:

```bash
curl https://your-site.netlify.app/api/repo/facebook/react
```

Expected response:
```json
{
  "id": "facebook/react",
  "description": "The library for web and native user interfaces.",
  "topics": ["javascript", "react", "frontend", "declarative", "ui"],
  "languages": ["JavaScript", "TypeScript", "HTML", "CSS", "C++"],
  "forks": 49230,
  ...
}
```

## Database Management

### View Database in Turso Dashboard

```bash
# Open Turso web dashboard
turso db show the-git-bang --url
# Visit: https://turso.tech/
```

### Query Database via CLI

```bash
# Interactive shell
turso db shell the-git-bang

# Run a query
turso db shell the-git-bang "SELECT COUNT(*) FROM repositories"

# Check specific repository
turso db shell the-git-bang "SELECT * FROM repositories WHERE id = 'facebook/react'"
```

### Re-migrate Data (if needed)

If you need to update the database with new data:

```bash
# Run the migration script
python3 scripts/migrate-to-turso.py
```

This will use `INSERT OR REPLACE` to update existing rows and add new ones.

### Rotate Auth Token

If you need to rotate the auth token for security:

```bash
# Create a new token
turso db tokens create the-git-bang

# Update .env file with new token
# Update Netlify environment variables
```

## Migration Script

The migration script (`scripts/migrate-to-turso.py`) does the following:

1. Reads all repositories from `server/db/repositories.db`
2. Connects to Turso using credentials from `.env`
3. Batch inserts repositories (100 at a time for efficiency)
4. Uses `INSERT OR REPLACE` to handle duplicates
5. Verifies final count

## API Endpoint

The updated endpoint (`/api/repo/:owner/:name`) now:

- ✅ Connects to Turso instead of local SQLite
- ✅ Works in serverless environments (Netlify Functions)
- ✅ Uses async/await for database queries
- ✅ Returns same data structure as before
- ✅ Parses pipe-separated lists (topics, languages) into arrays

## Code Changes Summary

### Before (better-sqlite3)
```typescript
import Database from "better-sqlite3";

const db = new Database("server/db/repositories.db", { readonly: true });

export function handleGetRepository(req, res) {
  const stmt = db.prepare("SELECT * FROM repositories WHERE id = ?");
  const result = stmt.get(repoId);
  // ...
}
```

### After (@libsql/client)
```typescript
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function handleGetRepository(req, res) {
  const result = await db.execute({
    sql: "SELECT * FROM repositories WHERE id = ?",
    args: [repoId],
  });
  // ...
}
```

## Troubleshooting

### "Database not initialized" error

Make sure environment variables are set:

```bash
# Check if variables are loaded
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN
```

### Connection timeout

Check that the database URL is correct:

```bash
turso db show the-git-bang --url
```

### Row count mismatch

Verify the count in Turso:

```bash
turso db shell the-git-bang "SELECT COUNT(*) FROM repositories"
```

If it's wrong, re-run the migration script.

## Cost & Limits

Turso free tier includes:
- 9 GB of total storage
- 1 billion row reads per month
- 25 million row writes per month

Current usage:
- Storage: ~50 MB (55,414 rows)
- Expected reads: Low (cached client-side)
- Expected writes: None (read-only database)

## Additional Resources

- [Turso Documentation](https://docs.turso.tech/)
- [LibSQL Client Documentation](https://docs.turso.tech/reference/client-access)
- [Turso Pricing](https://turso.tech/pricing)
