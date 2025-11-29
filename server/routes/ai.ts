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

  console.log(`🤖 [Generate] Request received. Content-Type: ${req.headers["content-type"]}`);

  // Helper to parse body from various formats (Express body, Netlify event body, Buffer)
  const parseBody = (req: Request): any => {
    let body = req.body;

    // Check for Netlify/AWS Lambda event body directly
    // @ts-ignore - apiGateway property is added by serverless-http
    const eventBody = req.apiGateway?.event?.body;

    // If req.body is empty/useless and we have an event body, use that
    if ((!body || Object.keys(body).length === 0) && eventBody) {
      console.log("🔍 Using event.body fallback");
      body = eventBody;
    }

    // Handle Buffer or Buffer-like objects (which is what we saw in the logs: { type: 'Buffer', data: [...] })
    if (body && typeof body === 'object' && body.type === 'Buffer' && Array.isArray(body.data)) {
      console.log("🔍 Detected Buffer-like body object, converting to string...");
      try {
        const buffer = Buffer.from(body.data);
        body = buffer.toString('utf8');
        console.log("🔍 Converted Buffer to string successfully.");
      } catch (e) {
        console.error("❌ Failed to convert Buffer to string:", e);
      }
    } else if (Buffer.isBuffer(body)) {
      console.log("🔍 Detected raw Buffer body, converting to string...");
      body = body.toString('utf8');
    }

    // If it's a string (now), parse it
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
        console.log("🔍 Parsed string body successfully.");
      } catch (e) {
        console.error("❌ Failed to parse string body:", e);
      }
    }

    return body;
  };

  const body = parseBody(req);

  const { name, description, topics, languages } = body || {};

  if (!name) {
    console.error("❌ [Generate] Missing 'name' in body:", body);
    res.status(400).json({
      error: "Repository name is required",
      receivedBody: body,
      debug: {
        type: typeof req.body,
        isBuffer: Buffer.isBuffer(req.body)
      }
    });
    return;
  }

  console.log(`🤖 Generating Vibe Coding ideas for: ${name}`);

  try {
    const prompt = `Generate 3 innovative app ideas for "${name}" repository.

Repository: ${name}
Description: ${description}
Topics: ${topics?.join(", ") || "N/A"}
Languages: ${languages?.join(", ") || "N/A"}

Requirements:
- Professional, market-ready ideas
- Can be built using this repo as foundation
- Include Builder.io integration angle
- Include monetization strategy

Return ONLY a JSON array (no markdown):
[
  {
    "title": "App Name",
    "description": "2-3 sentence pitch",
    "builder_angle": "How Builder.io accelerates this",
    "monetization_strategy": "Revenue model",
    "potential_mrr": "$X-$Y/mo"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    }, { timeout: 8000 });

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
  // Skip gitingest on serverless environments (Netlify, Lambda, etc.)
  // The virtual environment isn't deployed and would cause timeouts
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log(`⏭️  Skipping gitingest on serverless environment for ${repoName}`);
    return null;
  }

  try {
    // Limit the output to 500kb to avoid context window issues if the repo is huge
    // The -o - flag outputs to stdout
    // Set a strict timeout of 5 seconds. If it takes longer, we skip it.
    const { stdout } = await execAsync(
      `./.gitingest_venv/bin/gitingest https://github.com/${repoName} -o -`,
      {
        maxBuffer: 1024 * 1024 * 5, // 5MB buffer
        timeout: 5000 // 5 seconds timeout (reduced for Netlify's 10s function limit)
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

  // Re-use the parsing logic (we can't easily share the function across exports without refactoring, so duplicating the logic for safety/speed)
  let body = req.body;

  // Check for Netlify/AWS Lambda event body directly
  // @ts-ignore - apiGateway property is added by serverless-http
  const eventBody = req.apiGateway?.event?.body;

  if ((!body || Object.keys(body).length === 0) && eventBody) {
    console.log("🔍 [Explore] Using event.body fallback");
    body = eventBody;
  }

  // Handle Buffer or Buffer-like objects
  if (body && typeof body === 'object' && body.type === 'Buffer' && Array.isArray(body.data)) {
    console.log("🔍 [Explore] Detected Buffer-like body object, converting to string...");
    try {
      const buffer = Buffer.from(body.data);
      body = buffer.toString('utf8');
      console.log("🔍 [Explore] Converted Buffer to string successfully.");
    } catch (e) {
      console.error("❌ [Explore] Failed to convert Buffer to string:", e);
    }
  } else if (Buffer.isBuffer(body)) {
    console.log("🔍 [Explore] Detected raw Buffer body, converting to string...");
    body = body.toString('utf8');
  }

  // If it's a string (now), parse it
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
      console.log("🔍 [Explore] Parsed string body successfully.");
    } catch (e) {
      console.error("❌ [Explore] Failed to parse string body:", e);
    }
  }

  console.log(`🔍 [Explore] Final Body content:`, JSON.stringify(body).slice(0, 200) + "...");

  const { name, description, topics, languages } = body || {};

  if (!name) {
    console.error("❌ [Explore] Missing 'name' in body. Received:", body);
    res.status(400).json({
      error: "Repository name is required",
      receivedBody: body,
      debug: {
        type: typeof req.body,
        isBuffer: Buffer.isBuffer(req.body)
      }
    });
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
      max_tokens: 2000,
    }, { timeout: 8000 });

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
    const prompt = `Create a step-by-step execution plan for building this app idea using Builder.io.

App: "${ideaTitle}"
Description: ${ideaDescription}
Builder.io Angle: ${ideaBuilderAngle}
Existing Repo: ${repoName}

REQUIRED STEPS (use this structure):
1. Sign up or Sign in to [Builder.io](https://builderio.partnerlinks.io/5ao76wthwoji)
2. Connect repository "${repoName}" to Builder.io Fusion
3. Import from Figma or generate features with text prompts
4. Use Visual Editor + MCP Servers (Stripe, Database, etc.) to refine
5. Review and merge the Pull Request
6. Provide 5 specific prompts for Builder.io Fusion (recommend Claude 4.5 Opus)

Use Markdown formatting. Be concise and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    }, { timeout: 8000 });

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
