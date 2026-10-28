import { embedTexts } from "./embed.js";
import { cachedChunks, type Chunk } from "./store.js";

export interface Hit { chunk: Chunk; score: number }
export const minSimilarity = () => Number(process.env.MIN_SIMILARITY ?? 0.58);

const tokens = (s: string) => s.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 1);

/** Fallback when the embedding API is unavailable: share of query words found in the passage. */
function lexical(q: string, k: number): Hit[] {
  const qt = [...new Set(tokens(q))]; if (qt.length < 2) return [];
  return cachedChunks().map((chunk) => {
    const hay = (chunk.title + " " + chunk.text).toLowerCase();
    const m = qt.filter((t) => hay.includes(t)).length;
    return { chunk, score: m / qt.length, m };
  }).filter((h) => h.m >= 2 && h.score >= 0.6).sort((a, b) => b.score - a.score).slice(0, k);
}

/** Top-k passages; `threshold: 0` returns the raw ranking (used by the admin "test search"). */
export async function searchKb(query: string, k = 6, threshold = minSimilarity()): Promise<Hit[]> {
  const all = cachedChunks(); if (!all.length || !query.trim()) return [];
  try {
    const [qv] = await embedTexts([query], "RETRIEVAL_QUERY");
    const scored = all.map((chunk) => { let s = 0; for (let i = 0; i < qv.length; i++) s += qv[i] * chunk.vec[i]; return { chunk, score: s }; });
    return scored.sort((a, b) => b.score - a.score).slice(0, k).filter((h) => h.score >= threshold);
  } catch (e: any) { console.error("embed query failed, using keyword search:", e.message); return threshold === 0 ? [] : lexical(query, k); }
}
