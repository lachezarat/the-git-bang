import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetRepository } from "./routes/repositories";
import { handleGenerateIdeas } from "./routes/ai";

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

  // Repository details from Turso
  app.get("/api/repo/:owner/:name", handleGetRepository);

  // AI Generation
  app.post("/api/ai/generate", handleGenerateIdeas);

  return app;
}
