import type { ChatMessage, ChatResponse } from "../types.js";

type Result = Pick<ChatResponse, "reply" | "provider" | "usedWeb" | "webLinks">;
const TIMEOUT_MS = 25_000;

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    return await r.json();
  } finally { clearTimeout(t); }
}

export async function callGemini(system: string, msgs: ChatMessage[], web: boolean, temp = 0.3): Promise<Result> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const body: any = {
    systemInstruction: { parts: [{ text: system }] },
    contents: msgs.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: { temperature: temp, maxOutputTokens: 1400 },
  };
  if (web) body.tools = [{ google_search: {} }];
  const data = await postJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { "x-goog-api-key": key }, body);
  const cand = data.candidates?.[0];
  const reply = (cand?.content?.parts ?? []).map((p: any) => p.text ?? "").join("").trim();
  if (!reply) throw new Error("Gemini empty reply");
  const webLinks = (cand?.groundingMetadata?.groundingChunks ?? [])
    .map((c: any) => c.web && { title: c.web.title as string, uri: c.web.uri as string }).filter(Boolean).slice(0, 4);
  return { reply, provider: "gemini", usedWeb: web, webLinks };
}

export async function callGroq(system: string, msgs: ChatMessage[], temp = 0.3): Promise<Result> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing");
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";
  const data = await postJson("https://api.groq.com/openai/v1/chat/completions", { Authorization: `Bearer ${key}` }, {
    model,
    temperature: temp, max_tokens: 1400,
    ...(/gpt-oss/.test(model) ? { reasoning_effort: "low" } : {}),   // gpt-oss thinks first; keep it short so the answer is not cut off
    messages: [{ role: "system", content: system }, ...msgs],
  });
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Groq empty reply");
  return { reply, provider: "groq", usedWeb: false };
}

type P = "gemini" | "groq";
const pausedUntil: Record<P, number> = { gemini: 0, groq: 0 };
const hasKey = (p: P) => !!(p === "gemini" ? process.env.GEMINI_API_KEY : process.env.GROQ_API_KEY);
const statusOf = (e: any) => Number(/^(\d{3})\b/.exec(String(e?.message ?? ""))?.[1] ?? 0);

/** True if at least one provider has a key and is not paused. When false, the chatbot answers straight from the stored data. */
export const llmAvailable = () => (["gemini", "groq"] as P[]).some((p) => hasKey(p) && Date.now() >= pausedUntil[p]);

/** A provider that says "quota over" (429) or "model not found" (404) will keep saying it, so stop asking for a while instead of waiting on it for every question. */
function pause(p: P, e: any) {
  const st = statusOf(e);
  const mins = st === 429 ? 10 : [400, 401, 403, 404].includes(st) ? 60 : 1;
  pausedUntil[p] = Date.now() + mins * 60_000;
  const why = st === 429 ? "free quota/limit khatam" : st === 404 ? `model naam galat ya band (${p === "groq" ? "GROQ_MODEL" : "GEMINI_MODEL"} check karein)` : st === 401 || st === 403 ? "API key galat/band" : String(e?.message ?? e).slice(0, 120);
  console.warn(`[llm] ${p}: ${st || "error"} - ${why}. ${mins} min ke liye roka gaya.`);
}

/** Tries the preferred provider, then the other. Paused providers are skipped; 4xx errors are not retried. */
export async function generateWithFailover(system: string, msgs: ChatMessage[], web: boolean, temp = 0.3): Promise<Result> {
  const order: P[] = process.env.PRIMARY_PROVIDER === "groq" ? ["groq", "gemini"] : ["gemini", "groq"];
  for (const p of order) {
    if (!hasKey(p) || Date.now() < pausedUntil[p]) continue;
    for (let attempt = 0; attempt < 2; attempt++) {
      try { return p === "gemini" ? await callGemini(system, msgs, web, temp) : await callGroq(system, msgs, temp); }
      catch (e: any) {
        const st = statusOf(e);
        if ((st >= 400 && st < 500) || attempt === 1) { pause(p, e); break; }
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }
  throw new Error("LLM_UNAVAILABLE");
}