var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
var geminiApiKey = process.env.GEMINI_API_KEY || "";
var ai = null;
if (geminiApiKey) {
  ai = new import_genai.GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.use(import_express.default.json({ limit: "20mb" }));
app.use(import_express.default.urlencoded({ limit: "20mb", extended: true }));
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, image, weaknessVault, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key is not configured. Please set GEMINI_API_KEY in the Secrets panel in AI Studio settings."
      });
    }
    const weaknessContext = weaknessVault && weaknessVault.length > 0 ? `The candidate has the following active concepts logged in their 'Weakness Vault' containing recent exam topics they failed or struggled with: ${JSON.stringify(weaknessVault)}. Keep this context in mind to tailor and reinforce your advice on these specific topics if they discuss them.` : "";
    const systemInstruction = `You are a highly efficient, strict mentor AI for the RRB JE CBT-1 (Railway Recruitment Board Junior Engineer Computer Based Test 1) non-technical syllabus.
You cover four core pillars strictly: Mathematics, General Intelligence & Reasoning, General Science, and General Awareness.

${weaknessContext}

CRITICAL DIRECTNESS ENFORCEMENT:
- You must strictly provide direct, concise, and focused answers to the exact questions asked.
- Completely eliminate ALL conversational filler, introductory remarks, summarizing closing paragraphs, unsolicited pleasantries, or extraneous analytical preambles (e.g. "Sure, here's...", "I hope this helps").
- If the user asks for a formula, provide ONLY the formula and its immediate variables.
- If the user asks for a solution, show the exact step-by-step math layout immediately without narrative preambles.
- No fluff, no small talk. Jump straight to the code, layout, explanation, or equation in clean markdown formatting. Code blocks or mathematical representations must be precise.`;
    let contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }
    const currentParts = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }
    currentParts.push({ text: prompt });
    contents.push({
      role: "user",
      parts: currentParts
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2
        // low temperature for extreme factual directness
      }
    });
    const replyText = response.text || "No response text was generated.";
    return res.json({ text: replyText });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: err?.message || "An error occurred during response generation." });
  }
});
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting... Bind host: 0.0.0.0, Port: ${PORT}`);
  });
}
configureServer();
//# sourceMappingURL=server.cjs.map
