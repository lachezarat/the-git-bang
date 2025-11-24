import "dotenv/config";
import { createClient } from "@libsql/client";
import type { Request, Response } from "express";

// Initialize Turso database connection
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("Initializing Turso DB...");
console.log("URL:", url ? "Set" : "Missing");
console.log("Token:", authToken ? "Set" : "Missing");

if (!url || !authToken) {
  console.error("❌ Missing Turso environment variables!");
}

const db = createClient({
  url: url || "file:local.db", // Fallback to avoid crash during init if env missing
  authToken: authToken,
});

console.log("✅ Connected to Turso database (client created)");

export async function handleGetRepository(req: Request, res: Response) {
  const { owner, name } = req.params;
  const repoId = `${owner}/${name}`;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM repositories WHERE id = ?",
      args: [repoId],
    });

    if (result.rows.length > 0) {
      const row = result.rows[0];
      // Parse the pipe-separated lists back into arrays for the frontend
      const formatted = {
        ...row,
        topics: row.topics ? String(row.topics).split("|") : [],
        languages: row.languages ? String(row.languages).split("|") : [],
      };
      res.json(formatted);
    } else {
      res.status(404).json({ error: "Repository not found" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
