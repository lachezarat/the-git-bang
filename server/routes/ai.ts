import "dotenv/config";
import OpenAI from "openai";
import type { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";

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
    const prompt = `Generate 1 innovative, unique app idea for "${name}" repository.

Repository: ${name}
Description: ${description}
Topics: ${topics?.join(", ") || "N/A"}
Languages: ${languages?.join(", ") || "N/A"}

Requirements:
- Must be a UNIQUE, creative idea (avoid generic solutions)
- Professional, market-ready concept with real-world application
- Can be built using this repo as foundation
- Include detailed implementation roadmap
- Include specific Builder.io integration strategy
- Include comprehensive monetization strategy with revenue projections

Return ONLY a JSON array with ONE detailed idea (no markdown):
[
  {
    "title": "Compelling App Name",
    "description": "3-4 sentence detailed pitch explaining the unique value proposition, target audience, and key differentiator",
    "builder_angle": "Specific Builder.io features to leverage (e.g., Visual CMS, A/B testing, personalization). Explain exactly how Builder.io accelerates development and enables non-technical users to manage content",
    "technical_stack": "Recommended tech stack including frameworks, databases, APIs, and third-party services",
    "implementation_roadmap": "5-7 step development roadmap with estimated timeframes (e.g., '1. Setup core architecture (Week 1-2), 2. Implement authentication (Week 3)...')",
    "monetization_strategy": "Detailed revenue model including pricing tiers, customer acquisition strategy, and growth tactics",
    "potential_mrr": "$X-$Y/mo based on realistic projections",
    "target_audience": "Specific user personas and market segments",
    "competitive_advantage": "What makes this unique compared to existing solutions",
    "prompt_suggestions": [
      "Builder.io prompt 1: Detailed prompt for creating landing page components",
      "Builder.io prompt 2: Prompt for setting up content models",
      "Builder.io prompt 3: Prompt for implementing dynamic sections"
    ]
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    }, { timeout: 10000 });

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

async function getDeepWikiDocs(repoName: string): Promise<string | null> {
  console.log(`🔌 Connecting to DeepWiki MCP for ${repoName}...`);

  try {
    // Polyfill EventSource for Node.js environment
    // @ts-ignore
    global.EventSource = EventSource;

    const transport = new SSEClientTransport(
      new URL("https://mcp.deepwiki.com/sse"),
    );

    const client = new Client(
      {
        name: "the-git-bang-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    console.log("✅ Connected to DeepWiki MCP");

    // Call the read_wiki_contents tool
    // The tool expects a GitHub URL or owner/repo format
    const repoUrl = `https://github.com/${repoName}`;

    const result = await client.callTool({
      name: "read_wiki_contents",
      arguments: {
        repoName: repoName
      }
    });

    await client.close();

    // The result content is usually a list of content blocks
    // We want the text content
    // @ts-ignore - MCP SDK types might be slightly different, but structure is standard
    const markdown = result.content.map(c => c.text).join("\n");

    if (!markdown || markdown.length < 100) {
      console.warn("⚠️ DeepWiki returned empty or too short content.");
      return null;
    }

    console.log(`📄 Fetched ${markdown.length} bytes of docs from DeepWiki`);
    return markdown;

  } catch (error) {
    console.warn(`❌ Failed to fetch DeepWiki docs for ${repoName}:`, error);
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

  // Fetch the DeepWiki docs
  const docs = await getDeepWikiDocs(name);

  if (docs) {
    // Return DeepWiki documentation directly (no AI processing)
    console.log(`✅ Returning ${docs.length} bytes of DeepWiki docs directly`);
    res.json({
      markdown: docs,
      source: 'deepwiki'
    });
    return;
  }

  // Fallback: No DeepWiki docs available, generate a basic overview
  console.log(`⚠️ No DeepWiki docs found for ${name}, generating basic overview`);

  try {
    const prompt = `
      You are a Senior Software Architect and Technical Analyst.
      
      Your task is to provide a brief "Deep Dive" technical overview of the following GitHub repository.
      
      Repository Context:
      - Name: ${name}
      - Description: ${description}
      - Topics: ${topics?.join(", ")}
      - Languages: ${languages?.join(", ")}

      Please provide a response in Markdown format with the following sections:

      1. **Executive Summary**: A concise 2-3 sentence technical summary of what this project does and its core value.
      2. **Key Features**: A bulleted list of 3-5 standout technical features or capabilities (infer from description and topics).
      3. **Technical Stack**: Infer the tech stack based on languages and description.

      Keep the tone professional, insightful, and "cyberpunk" cool (subtle usage of tech-forward language).
    `;

    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    }, { timeout: 8000 });

    const responseText = completion.choices[0]?.message?.content || "";

    res.json({
      markdown: responseText,
      source: 'ai-fallback'
    });

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

  console.log(`📝 [IdeaPlan] Request received. Content-Type: ${req.headers["content-type"]}`);

  // Parse body (same logic as other endpoints for Netlify compatibility)
  let body = req.body;

  // Check for Netlify/AWS Lambda event body directly
  // @ts-ignore - apiGateway property is added by serverless-http
  const eventBody = req.apiGateway?.event?.body;

  if ((!body || Object.keys(body).length === 0) && eventBody) {
    console.log("🔍 [IdeaPlan] Using event.body fallback");
    body = eventBody;
  }

  // Handle Buffer or Buffer-like objects
  if (body && typeof body === 'object' && body.type === 'Buffer' && Array.isArray(body.data)) {
    console.log("🔍 [IdeaPlan] Detected Buffer-like body object, converting to string...");
    try {
      const buffer = Buffer.from(body.data);
      body = buffer.toString('utf8');
    } catch (e) {
      console.error("❌ [IdeaPlan] Failed to convert Buffer to string:", e);
    }
  } else if (Buffer.isBuffer(body)) {
    console.log("🔍 [IdeaPlan] Detected raw Buffer body, converting to string...");
    body = body.toString('utf8');
  }

  // If it's a string (now), parse it
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
      console.log("🔍 [IdeaPlan] Parsed string body successfully.");
    } catch (e) {
      console.error("❌ [IdeaPlan] Failed to parse string body:", e);
    }
  }

  const { ideaTitle, ideaDescription, ideaBuilderAngle, repoName } = body || {};

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
6. Provide 8 specific prompts for Builder.io Fusion (recommend using Claude 4.5 Opus) DO NOT CHANGE THE MODEL

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

// Helper function to ask questions via DeepWiki MCP
async function askDeepWikiQuestion(repoName: string, question: string): Promise<string | null> {
  console.log(`❓ Asking DeepWiki about ${repoName}: "${question}"`);

  try {
    // Polyfill EventSource for Node.js environment
    // @ts-ignore
    global.EventSource = EventSource;

    const transport = new SSEClientTransport(
      new URL("https://mcp.deepwiki.com/sse"),
    );

    const client = new Client(
      {
        name: "the-git-bang-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    console.log("✅ Connected to DeepWiki MCP for Q&A");

    // Call the ask_question tool
    const result = await client.callTool({
      name: "ask_question",
      arguments: {
        repoName: repoName,
        question: question
      }
    });

    await client.close();

    // Extract the answer from the result
    // @ts-ignore
    const answer = result.content.map(c => c.text).join("\n");

    if (!answer || answer.length < 10) {
      console.warn("⚠️ DeepWiki returned empty or too short answer.");
      return null;
    }

    console.log(`💡 Received answer (${answer.length} chars)`);
    return answer;

  } catch (error) {
    console.warn(`❌ Failed to ask DeepWiki question for ${repoName}:`, error);
    return null;
  }
}

// New endpoint: Ask a question about a repository
export async function handleAskQuestion(req: Request, res: Response) {
  console.log("❓ [Ask Question] Request received");

  let body = req.body;

  // Handle buffer body (Netlify/serverless environments)
  if (typeof body === 'object' && body._readableState) {
    try {
      const bufferData = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        body.on('data', (chunk: Buffer) => chunks.push(chunk));
        body.on('end', () => resolve(Buffer.concat(chunks)));
        body.on('error', reject);
      });
      body = JSON.parse(bufferData.toString('utf8'));
    } catch (e) {
      console.error("❌ Failed to parse buffer body:", e);
    }
  } else if (Buffer.isBuffer(body)) {
    body = JSON.parse(body.toString('utf8'));
  } else if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.error("❌ Failed to parse string body:", e);
    }
  }

  const { name, question } = body || {};

  if (!name || !question) {
    console.error("❌ Missing 'name' or 'question' in request");
    res.status(400).json({
      error: "Repository name and question are required"
    });
    return;
  }

  console.log(`❓ Asking about ${name}: "${question}"`);

  try {
    const answer = await askDeepWikiQuestion(name, question);

    if (!answer) {
      res.json({
        answer: "I don't have enough information to answer that question about this repository.",
        source: 'fallback'
      });
      return;
    }

    res.json({
      answer: answer,
      source: 'deepwiki'
    });
  } catch (error) {
    console.error("DeepWiki Q&A error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get answer from DeepWiki",
    });
  }
}
