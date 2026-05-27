import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini API client if key exists
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Support large payloads for base64 image transfers
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Server API endpoints
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, image, weaknessVault, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!ai) {
      // Lazy warning if key is missing, fail gracefully so app doesn't crash on boot but reports key missing when called.
      return res.status(500).json({
        error: "Gemini API key is not configured. Please set GEMINI_API_KEY in the Secrets panel in AI Studio settings.",
      });
    }

    // Build the system instruction to enforce compliance with the rules specified in instructions
    const weaknessContext = weaknessVault && weaknessVault.length > 0 
      ? `The candidate has the following active concepts logged in their 'Weakness Vault' containing recent exam topics they failed or struggled with: ${JSON.stringify(weaknessVault)}. Keep this context in mind to tailor and reinforce your advice on these specific topics if they discuss them.`
      : "";

    const systemInstruction = `You are a highly efficient, strict mentor AI for the RRB JE CBT-1 (Railway Recruitment Board Junior Engineer Computer Based Test 1) non-technical syllabus.
You cover four core pillars strictly: Mathematics, General Intelligence & Reasoning, General Science, and General Awareness.

${weaknessContext}

CRITICAL DIRECTNESS ENFORCEMENT:
- You must strictly provide direct, concise, and focused answers to the exact questions asked.
- Completely eliminate ALL conversational filler, introductory remarks, summarizing closing paragraphs, unsolicited pleasantries, or extraneous analytical preambles (e.g. "Sure, here's...", "I hope this helps").
- If the user asks for a formula, provide ONLY the formula and its immediate variables.
- If the user asks for a solution, show the exact step-by-step math layout immediately without narrative preambles.
- No fluff, no small talk. Jump straight to the code, layout, explanation, or equation in clean markdown formatting. Code blocks or mathematical representations must be precise.`;

    // Map history to parts if provided
    let contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Add active prompt parts
    const currentParts: any[] = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
    currentParts.push({ text: prompt });

    contents.push({
      role: "user",
      parts: currentParts,
    });

    // Call generateContent using the correct SDK and gemini-3.5-flash as specified
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // low temperature for extreme factual directness
      },
    });

    const replyText = response.text || "No response text was generated.";
    return res.json({ text: replyText });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: err?.message || "An error occurred during response generation." });
  }
});

// Configure Vite or Static server based on environment
async function configureServer() {
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
    console.log(`Server starting... Bind host: 0.0.0.0, Port: ${PORT}`);
  });
}

configureServer();
