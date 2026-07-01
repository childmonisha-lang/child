import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Gemini AI client to prevent startup crashes when keys are missing
let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it via the AI Studio Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// 1. AI Terminal Chat Endpoint
app.post("/api/gemini/terminal", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const ai = getGeminiClient();

    // Prepare system instruction for a high-tech financial intelligence assistant
    const systemInstruction = 
      "You are the FUTURELEDGER Terminal AI, an advanced on-chain intelligence node. " +
      "You speak with absolute clarity, using professional, highly technical financial and crypto jargon. " +
      "You analyze decentralized protocols, Layer-2 structures, TVL dominance, neural capital networks, " +
      "and macroeconomic forces. Keep responses scannable, clear, and action-oriented. " +
      "Do not use generic conversational filler. Format responses in clean markdown with headers, bold key phrases, " +
      "or small code/data tables. Do not mention that you are a language model or AI built by Google unless asked.";

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Load history if provided
    if (history && Array.isArray(history)) {
      // FutureLedger handles message pairs
      // Simply pass current message or construct contents if needed, but for our terminal:
      // We can also use ai.models.generateContent to make it more reliable for custom inputs
    }

    // Let's use direct generateContent with historical context for ultimate stability
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      response: response.text || "No intelligence data returned.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("AI Terminal Error:", error);
    res.status(500).json({
      error: error.message || "Failed to process on-chain command."
    });
  }
});

// 2. Article Summarizer Endpoint
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;
    if (!content) {
      res.status(400).json({ error: "Content is required." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      "You are the senior editorial synthesizer at FUTURELEDGER. " +
      "Synthesize the provided article into a high-level executive briefing. " +
      "Explain: 1. Core Thesis, 2. Key Metrics/Protocols mentioned, 3. Strategic implications for investors. " +
      "Deliver output in 3 short, high-density, beautifully styled bullet sections under appropriate headers. " +
      "Use professional financial vocabulary.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Title: ${title || ""}\nSubtitle: ${subtitle || ""}\nContent: ${content}`,
      config: {
        systemInstruction,
        temperature: 0.4
      }
    });

    res.json({
      summary: response.text || "Unable to synthesize content.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Summarizer Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate summary."
    });
  }
});

// 3. AI Article Generator (Produces rich, ready-to-publish JSON articles)
app.post("/api/gemini/generate-article", async (req, res) => {
  try {
    const { prompt, category } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      "You are the lead research analyst at FUTURELEDGER. " +
      "Draft a ground-breaking, institutional-grade finance, Web3, or AI intelligence article based on the prompt. " +
      "The article must be intellectually rigorous, filled with specific hypothetical/analytical details, " +
      "written in an elegant, authoritative style with architectural clarity. " +
      "Structure your response to strictly match the requested JSON schema.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a detailed ledger intelligence article on: "${prompt}". Category requested: ${category || "AI & TECH"}.`,
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: "An authoritative, punchy display title, e.g., 'The Sovereign Node: Re-architecting Yield Pools'" 
            },
            subtitle: { 
              type: Type.STRING, 
              description: "A highly informative, technical subtitle summarizing the thesis." 
            },
            category: { 
              type: Type.STRING, 
              description: "One of these exact strings: 'AI & TECH', 'WEB3 PULSE', 'MONEY MAKING'" 
            },
            content: { 
              type: Type.STRING, 
              description: "Detailed, beautiful article body in markdown (approx 500-700 words), with structured subheadings, list items, and clear analytical sections." 
            },
            readingTime: { 
              type: Type.STRING, 
              description: "Calculated reading time, e.g. '6 min read'" 
            },
            author: { 
              type: Type.STRING, 
              description: "An elegant, realistic author name (e.g., 'Dr. Evelyn Vance', 'Sarah Chen', 'Marcus Thorne')" 
            }
          },
          required: ["title", "subtitle", "category", "content", "readingTime", "author"]
        }
      }
    });

    const resultText = response.text || "{}";
    const article = JSON.parse(resultText);

    res.json({
      success: true,
      article,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Generator Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate intelligence article."
    });
  }
});

// Vite Middleware for Development / Static Asset Serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FUTURELEDGER Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
