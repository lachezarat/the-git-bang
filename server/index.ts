import dotenv from "dotenv";
import path from "path";

// Load .env first
dotenv.config();
// Load .env.local if it exists (overriding .env)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

import { handleGenerateIdeas, handleExploreRepo } from "./routes/ai";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);



  // AI Generation
  app.post("/api/ai/generate", handleGenerateIdeas);
  app.post("/api/ai/explore", handleExploreRepo);

  return app;
}
