import "dotenv/config";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import cors from "cors";
import { kbSize } from "./rag/retriever.js";
import { admin } from "./admin.js";
import { publicApi } from "./public.js";
import { startContentLoading } from "./content/store.js";
import { answer } from "./answer.js";
import { firebaseConfigured } from "./firebase.js";
import { startLoading, cacheSize } from "./kb/store.js";
import { generateWithFailover } from "./llm/providers.js";
import type { ChatRequest, ChatResponse } from "./types.js";
import { LIBRARY } from "./library.js";
import { geminiTts } from "./tts.js";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? "*" }));
app.use("/api/admin", admin);
app.use("/api", publicApi);                 // news / gallery / images for the public website              // has its own (bigger) JSON limit for file uploads
app.use(express.json({ limit: "50kb" }));

// tiny in-memory rate limit: 20 req/min per IP
const hits = new Map<string, number[]>();
app.use(["/api/chat", "/api/translate", "/api/tts"], (req, res, next) => {
  const ip = req.ip ?? "x", now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (arr.length >= 20) return res.status(429).json({ error: "Too many requests. Please wait a minute." });
  arr.push(now); hits.set(ip, arr); next();
});

app.get("/api/library", (_q, r) => r.json(LIBRARY));

app.post("/api/translate", async (req, res) => {
  const text = String(req.body?.text ?? "").slice(0, 3000);
  if (!text) return res.status(400).json({ error: "No text" });
  try {
    const out = await generateWithFailover(
      "Translate the following Hindi devotional text into simple, faithful English. Do not add commentary, do not add or drop meaning. Output only the translation.",
      [{ role: "user", content: text }], false);
    res.json({ text: out.reply });
  } catch (e: any) { console.error(e.message); res.status(503).json({ error: "Translation unavailable" }); }
});

app.post("/api/tts", async (req, res) => {
  const text = String(req.body?.text ?? "").slice(0, 1500);
  if (!text || process.env.ENABLE_TTS === "false") return res.status(400).json({ error: "TTS unavailable" });
  try { res.type("audio/wav").send(await geminiTts(text)); }
  catch (e: any) { console.error(e.message); res.status(503).json({ error: "TTS unavailable" }); }
});

app.get("/api/health", (_q, r) => r.json({ ok: true, kbEntries: kbSize() }));

app.post("/api/chat", async (req, res) => {
  const { messages, lang } = req.body as ChatRequest;
  if (!Array.isArray(messages) || !messages.length || (lang !== "hi" && lang !== "en"))
    return res.status(400).json({ error: "Invalid request" });
  const msgs = messages.slice(-8).map((m) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: String(m.content).slice(0, 1500) }));
  const last = [...msgs].reverse().find((m) => m.role === "user")?.content ?? "";

  try { res.json(await answer(lang, msgs)); }
  catch (e: any) {
    console.error(e.message);
    res.status(503).json({ error: lang === "hi" ? "अभी सेवा उपलब्ध नहीं है, कृपया थोड़ी देर बाद प्रयास करें।" : "Service is temporarily unavailable. Please try again shortly." });
  }
});

// Optional single-host deploy: STATIC_DIR=../dist/aghor-peeth-janseva/browser
const staticDir = process.env.STATIC_DIR ? resolve(process.env.STATIC_DIR) : "";
if (staticDir && existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get(/^(?!\/api).*/, (_q, r) => r.sendFile(resolve(staticDir, "index.html")));
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`Devotion chatbot API on :${port}`));
if (firebaseConfigured()) startContentLoading().then(() => console.log("Website content loaded")).catch((e) => console.error("Content load failed:", e.message));
if (firebaseConfigured()) startLoading().then(() => console.log(`Firestore knowledge loaded: ${cacheSize()} passages`)).catch((e) => console.error("Firestore load failed:", e.message));
else console.warn("Firebase not configured - uploaded knowledge and admin panel are disabled (see FIREBASE_SETUP.md).");
