import "dotenv/config";
import OpenAI from "openai";
import type { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";

// Initialize OpenRouter client
// We assume OPENROUTER_API_KEY is set in .env
function getAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });
}

export async function handleGenerateIdeas(req: Request, res: Response) {
  const openai = getAIClient();

  if (!openai) {
    console.error("OpenRouter API key is missing. Env check:", {
      hasKey: !!process.env.OPENROUTER_API_KEY,
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
      You are a Senior Product Manager and Technical Lead.
      
      Your task is to generate 9 innovative and practical app ideas based on the existing repository: "${name}".
      
      The ideas should be:
      1. **Professional & Market-Ready:** Focus on solving real problems or enhancing developer productivity.
      2. **Feasible:** Can be built using the existing code as a foundation.
      3. **High Value:** Have clear potential for monetization or significant user adoption.

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

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // Robust JSON extraction: find the first '[' and the last ']'
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.error("Failed to extract JSON from response:", responseText);
      throw new Error("AI response did not contain a valid JSON array.");
    }

    const cleanJson = jsonMatch[0];
    const ideas = JSON.parse(cleanJson);

    res.json({ ideas });
  } catch (error) {
    console.error("OpenRouter generation error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate ideas from the machine spirits.",
    });
  }
}

const execAsync = promisify(exec);

async function fetchRepoDigest(repoName: string): Promise<string | null> {
  try {
    // Limit the output to 500kb to avoid context window issues if the repo is huge
    // The -o - flag outputs to stdout
    // Set a strict timeout of 3 seconds. If it takes longer, we skip it.
    const { stdout } = await execAsync(
      `./.gitingest_venv/bin/gitingest https://github.com/${repoName} -o -`,
      {
        maxBuffer: 1024 * 1024 * 5, // 5MB buffer
        timeout: 15000 // 15 seconds timeout
      }
    );
    return stdout;
  } catch (error) {
    console.warn(`Failed to fetch Gitingest for ${repoName} (likely timeout or error):`, error);
    return null;
  }
}

export async function handleExploreRepo(req: Request, res: Response) {
  const openai = getAIClient();

  if (!openai) {
    res
      .status(500)
      .json({ error: "AI service not configured (missing API key)" });
    return;
  }

  console.log(`🔍 [Explore] Request received. Content-Type: ${req.headers["content-type"]}`);
  console.log(`🔍 [Explore] Raw Body type: ${typeof req.body}`);

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
      console.log("🔍 [Explore] Parsed string body successfully.");
    } catch (e) {
      console.error("🔍 [Explore] Failed to parse string body:", e);
    }
  }

  console.log(`🔍 [Explore] Body content:`, JSON.stringify(body).slice(0, 200) + "...");

  const { name, description, topics, languages } = body;

  if (!name) {
    console.error("❌ [Explore] Missing 'name' in body:", body);
    res.status(400).json({ error: "Repository name is required", receivedBody: body });
    return;
  }

  console.log(`🔍 Exploring repository depth for: ${name}`);

  // Fetch the actual code digest
  const digest = await fetchRepoDigest(name);
  const hasDigest = !!digest;

  try {
    const prompt = `
      You are a Senior Software Architect and Technical Analyst.
      
      Your task is to provide a "Deep Dive" technical overview of the following GitHub repository.
      
      Repository Context:
      - Name: ${name}
      - Description: ${description}
      - Topics: ${topics?.join(", ")}
      - Languages: ${languages?.join(", ")}

      ${hasDigest
        ? `
      **ACTUAL CODEBASE DIGEST (Gitingest):**
      Below is a text digest of the repository's file structure and content. USE THIS to analyze the REAL architecture, not just the description.
      
      ${digest.slice(0, 100000)} ... (truncated if too long)
      `
        : ""
      }

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

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
    }, { timeout: 25000 });

    const responseText = completion.choices[0]?.message?.content || "";

    res.json({ markdown: responseText });
  } catch (error) {
    console.error("OpenRouter exploration error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to explore the repository depth.",
    });
  }
}

export async function handleGetIdeaPlan(req: Request, res: Response) {
  const openai = getAIClient();

  if (!openai) {
    res
      .status(500)
      .json({ error: "AI service not configured (missing API key)" });
    return;
  }

  const { ideaTitle, ideaDescription, ideaBuilderAngle, repoName } = req.body;

  if (!ideaTitle) {
    res.status(400).json({ error: "Idea title is required" });
    return;
  }

  console.log(`📝 Generating execution plan for: ${ideaTitle}`);

  try {
    const prompt = `
      You are a Senior Product Manager and Technical Lead.
      
      Your task is to create a detailed, step-by-step execution plan to build the following app idea using **Builder.io** and the existing repository "${repoName}".

      App Idea: "${ideaTitle}"
      Description: "${ideaDescription}"
      Builder.io Angle: "${ideaBuilderAngle}"

      CRITICAL INSTRUCTION:
      You MUST structure the response as a numbered list of steps.
      
      **Step 1 MUST BE EXACTLY:**
      "1. Sign up or Sign in to [Builder.io](https://builderio.partnerlinks.io/5ao76wthwoji)"
      
      Do NOT add any description or extra text for Step 1. Just the numbered item with the link.

      **For the remaining steps, you MUST follow the "Builder.io Fusion" workflow:**

      **Step 2: Connect your Repository**
      - Explain how to connect the existing "${repoName}" repository to Builder.io Fusion.
      - Mention that code stays in their infrastructure.

      **Step 3: Import Design or Generate**
      - **CRITICAL:** Explicitly mention **"Import from Figma"** as a key capability to turn designs into code instantly.
      - Alternatively, explain how to generate features using text prompts if no design exists.

      **Step 4: Iterate and Refine (with MCPs)**
      - Explain how to use the **Visual Editor** to refine the generated code.
      - **CRITICAL:** Mention using **MCP Servers (Model Context Protocol)** to connect to external tools or data sources (e.g., "Connect a Stripe MCP", "Use a Database MCP").
      - Explain how to use the existing components from the repo (Design System integration).

      **Step 5: Review and Merge**
      - Explain the **Pull Request workflow**: Builder.io sends a PR to the repo.
      - Mention reviewing the code and merging it into the main branch.

      **Step 6: Fusion Prompts (CRITICAL)**
      Provide 5-8 specific, high-quality prompts that the user can copy and paste into Builder.io Fusion to build this app.
      - These prompts should be sequential or cover different parts of the app.
      - **Recommended Model:** Explicitly recommend using **Claude 4.5 Opus** (or the most advanced Claude model available) for the best results in Fusion.

      Keep the tone encouraging, professional, and action-oriented. Use Markdown formatting.
    `;

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0]?.message?.content || "";

    res.json({ markdown: responseText });
  } catch (error) {
    console.error("OpenRouter plan generation error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate execution plan.",
    });
  }
}
