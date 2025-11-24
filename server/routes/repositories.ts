import "dotenv/config";
import { createClient } from "@libsql/client";
import type { Request, Response } from "express";

// Initialize Turso database connection
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    "Missing required environment variables: TURSO_DATABASE_URL and/or TURSO_AUTH_TOKEN"
  );
}

const db = createClient({
  url: url,
  authToken: authToken,
});

console.log("✅ Turso database client initialized");

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
