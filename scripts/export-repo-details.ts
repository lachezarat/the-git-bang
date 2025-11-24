import "dotenv/config";
import { createClient } from "@libsql/client";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

const db = createClient({ url, authToken });

async function exportToJSON() {
    console.log("📥 Fetching all repository details from Turso...");

    const result = await db.execute("SELECT * FROM repositories");

    console.log(`✅ Found ${result.rows.length} repositories`);

    // Transform the data
    const repoMap: Record<string, any> = {};

    for (const row of result.rows) {
        const id = String(row.id);
        repoMap[id] = {
            id: row.id,
            description: row.description || "",
            topics: row.topics ? String(row.topics).split("|") : [],
            languages: row.languages ? String(row.languages).split("|") : [],
            forks: row.forks || 0,
            commits: row.activity_commits || 0,
            watchers: row.growth_watchers || 0,
            openPrs: row.health_prs || 0,
            contributors: row.community_contributors || 0,
        };
    }

    // Write to public folder
    const outputPath = resolve(__dirname, "../public/repo-details.json");
    writeFileSync(outputPath, JSON.stringify(repoMap, null, 2));

    console.log(`✅ Exported to ${outputPath}`);
    console.log(`📦 File size: ${(JSON.stringify(repoMap).length / 1024).toFixed(2)} KB`);
}

exportToJSON().catch(console.error);
