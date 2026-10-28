import { geminiPost } from "./gemini.js";

const MODEL = () => process.env.EMBED_MODEL ?? "gemini-embedding-001";
const DIM = () => Number(process.env.EMBED_DIM ?? 768);
export type EmbedTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

function normalize(v: number[]): Float32Array {
  let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1;
  const out = new Float32Array(v.length); for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

const qCache = new Map<string, Float32Array>();   // repeated questions cost no API call

/** Returns unit-length vectors (so cosine similarity = dot product). */
export async function embedTexts(texts: string[], task: EmbedTask): Promise<Float32Array[]> {
  const ck = task === "RETRIEVAL_QUERY" && texts.length === 1 ? texts[0].trim().toLowerCase() : "";
  if (ck && qCache.has(ck)) return [qCache.get(ck)!];
  const out = await embedUncached(texts, task);
  if (ck) { qCache.set(ck, out[0]); if (qCache.size > 300) qCache.delete(qCache.keys().next().value as string); }
  return out;
}

async function embedUncached(texts: string[], task: EmbedTask): Promise<Float32Array[]> {
  const out: Float32Array[] = [];
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    const data = await geminiPost(`models/${MODEL()}:batchEmbedContents`, {
      requests: batch.map((t) => ({
        model: `models/${MODEL()}`, content: { parts: [{ text: t.slice(0, 6000) }] },
        taskType: task, outputDimensionality: DIM(),
      })),
    });
    const embs = data.embeddings as { values: number[] }[] | undefined;
    if (!embs || embs.length !== batch.length) throw new Error("Embedding response malformed");
    for (const e of embs) out.push(normalize(e.values));
  }
  return out;
}