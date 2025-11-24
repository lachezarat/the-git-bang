import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import "dotenv/config";

async function migrateToTurso() {
  console.log("🚀 Starting migration to Turso...");

  // Connect to local SQLite
  const localDb = new Database("server/db/repositories.db", { readonly: true });
  console.log("✅ Connected to local SQLite database");

  // Connect to Turso
  const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  console.log("✅ Connected to Turso database");

  // Get all repositories from local SQLite
  const repositories = localDb.prepare("SELECT * FROM repositories").all();
  console.log(`📦 Found ${repositories.length} repositories to migrate`);

  // Batch insert into Turso (process in chunks for efficiency)
  const BATCH_SIZE = 100;
  let processed = 0;

  for (let i = 0; i < repositories.length; i += BATCH_SIZE) {
    const batch = repositories.slice(i, i + BATCH_SIZE);

    // Use transaction for batch insert
    const statements = batch.map((repo: any) => {
      return {
        sql: `INSERT OR REPLACE INTO repositories (id, description, topics, languages, forks, activity_commits, growth_watchers, health_prs, community_contributors)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          repo.id,
          repo.description,
          repo.topics,
          repo.languages,
          repo.forks,
          repo.activity_commits,
          repo.growth_watchers,
          repo.health_prs,
          repo.community_contributors,
        ],
      };
    });

    await tursoDb.batch(statements, "write");

    processed += batch.length;
    const percentage = ((processed / repositories.length) * 100).toFixed(1);
    process.stdout.write(`\r⏳ Progress: ${processed}/${repositories.length} (${percentage}%)`);
  }

  console.log("\n✅ Migration completed successfully!");

  // Verify count
  const result = await tursoDb.execute("SELECT COUNT(*) as count FROM repositories");
  console.log(`📊 Total repositories in Turso: ${result.rows[0].count}`);

  localDb.close();
  tursoDb.close();
}

// Run migration
migrateToTurso().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
