import Database from "better-sqlite3";
import type { Request, Response } from "express";
import path from "path";

// Initialize local SQLite database connection
const dbPath = path.resolve(process.cwd(), "local.db");
const db = new Database(dbPath);

console.log("✅ Local SQLite database initialized");

export async function handleGetRepository(req: Request, res: Response) {
  const { owner, name } = req.params;
  const repoId = `${owner}/${name}`;

  try {
    const stmt = db.prepare("SELECT * FROM repositories WHERE id = ?");
    const row = stmt.get(repoId) as any;

    if (row) {
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
