import Database from "better-sqlite3";
import path from "path";
import type { Request, Response } from "express";

// Initialize database connection
const dbPath = path.resolve(process.cwd(), "server/db/repositories.db");
let db: Database.Database;

try {
    db = new Database(dbPath, { readonly: true });
} catch (e) {
    console.error("Failed to open SQLite database:", e);
}

export function handleGetRepository(req: Request, res: Response) {
    const { owner, name } = req.params;
    const repoId = `${owner}/${name}`;

    if (!db) {
        return res.status(500).json({ error: "Database not initialized" });
    }

    try {
        const stmt = db.prepare("SELECT * FROM repositories WHERE id = ?");
        const result = stmt.get(repoId);

        if (result) {
            // Parse the pipe-separated lists back into arrays for the frontend
            const formatted = {
                ...result as any,
                topics: (result as any).topics ? (result as any).topics.split('|') : [],
                languages: (result as any).languages ? (result as any).languages.split('|') : []
            };
            res.json(formatted);
        } else {
            res.status(404).json({ error: "Repository not found" });
        }
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
