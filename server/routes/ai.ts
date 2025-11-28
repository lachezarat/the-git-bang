import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Request, Response } from "express";

// Initialize Gemini client
// We assume GEMINI_API_KEY is set in .env
// Lazy initialization to ensure env vars are loaded
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export async function handleGenerateIdeas(req: Request, res: Response) {
  const genAI = getGeminiClient();
  const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  if (!genAI || !model) {
    console.error("Gemini API key is missing. Env check:", {
      hasKey: !!process.env.GEMINI_API_KEY,
      cwd: process.cwd(),
    });
    res
      .status(500)
      .json({ error: "AI service not configured (missing API key)" });
    return;
  }

  const { name, description, topics, languages } = req.body;

  if (!name) {
    res.status(400).json({ error: "Repository name is required" });
    return;
  }

  console.log(`🤖 Generating Vibe Coding ideas for: ${name}`);

  try {
    const prompt = `
      You are an expert Product Architect and Creative Developer specializing in "Vibe Coding" - the art of rapidly building stylish, high-impact applications using modern visual development tools.

      Your goal is to analyze the following GitHub repository and generate 3 innovative, "vibey", and practical application ideas that could be built using this codebase as a foundation or inspiration.

      CRITICAL REQUIREMENT:
      Each idea MUST be framed as something that can be rapidly accelerated using **Builder.io**. 
      Explain how Builder.io's visual CMS, drag-and-drop capabilities, or GenAI integration would make building this specific idea faster and better.

      Repository Context:
      - Name: ${name}
      - Description: ${description}
      - Topics: ${topics?.join(", ")}
      - Languages: ${languages?.join(", ")}

      Output Format:
      Return strictly a JSON array of objects. Do not include markdown formatting like \`\`\`json.
      Each object must have:
      - "title": A catchy, cyberpunk/modern name for the app.
      - "description": A detailed 3-4 sentence pitch explaining the core value proposition and how it works.
      - "builder_angle": A specific sentence on how Builder.io speeds this up (e.g. "Use Builder for the landing page...", "Manage the UI components visually...").
      - "monetization_strategy": A specific strategy to make money (e.g. "Freemium model with pro features", "Enterprise licensing").
      - "potential_mrr": A realistic estimation of potential Monthly Recurring Revenue for a solo dev (e.g. "$10k - $100k/mo").

      Example JSON structure:
      [
        { "title": "Neo-Dashboard", "description": "...", "builder_angle": "...", "monetization_strategy": "...", "potential_mrr": "..." }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up potential markdown formatting if the model ignores instructions
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const ideas = JSON.parse(cleanJson);

    res.json({ ideas });
  } catch (error) {
    console.error("Gemini generation error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate ideas from the machine spirits.",
    });
  }
}

export async function handleExploreRepo(req: Request, res: Response) {
  const genAI = getGeminiClient();
  const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  if (!genAI || !model) {
    res
      .status(500)
      .json({ error: "AI service not configured (missing API key)" });
    return;
  }

  const { name, description, topics, languages } = req.body;

  if (!name) {
    res.status(400).json({ error: "Repository name is required" });
    return;
  }

  console.log(`🔍 Exploring repository depth for: ${name}`);

  try {
    const prompt = `
      You are a Senior Software Architect and Technical Analyst.
      
      Your task is to provide a "Deep Dive" technical overview of the following GitHub repository.
      
      Repository Context:
      - Name: ${name}
      - Description: ${description}
      - Topics: ${topics?.join(", ")}
      - Languages: ${languages?.join(", ")}

      Please provide a response in Markdown format with the following sections:

      1. **Executive Summary**: A concise 2-3 sentence technical summary of what this project does and its core value.
      2. **Key Features**: A bulleted list of 3-5 standout technical features or capabilities.
      3. **Architecture Visualization**:
         - Create a **Mermaid.js** diagram (use \`\`\`mermaid code block) that visualizes the conceptual architecture, data flow, or user journey of this application. 
         - Use "graph TD" or "graph LR".
         - CRITICAL: You MUST enclose ALL node labels in double quotes. Example: A["User"] --> B["API Server"].
         - Do NOT use brackets [] or parentheses () inside the node labels unless they are inside the double quotes.
         - Keep the diagram relatively simple but informative (e.g., User -> Frontend -> API -> Database). Infer the likely architecture based on the languages and description (e.g., if it's React/Node, show that structure).
      4. **Technical Stack Inference**: Briefly mention the likely tech stack components based on the languages and description.

      Keep the tone professional, insightful, and "cyberpunk" cool (subtle usage of tech-forward language).
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ markdown: responseText });
  } catch (error) {
    console.error("Gemini exploration error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to explore the repository depth.",
    });
  }
}
