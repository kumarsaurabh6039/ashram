/** Splits clean text into passages of roughly 350-900 characters, keeping paragraphs / verses together. */
const MIN = 350, MAX = 900;

function splitLong(p: string): string[] {
  const sents = p.split(/(?<=[।.!?])\s+/);
  const out: string[] = []; let cur = "";
  for (const s of sents) {
    if (cur && (cur + " " + s).length > MAX) { out.push(cur.trim()); cur = s; } else cur = cur ? cur + " " + s : s;
  }
  if (cur.trim()) out.push(cur.trim());
  // a "sentence" with no punctuation can still be huge: hard-split it
  return out.flatMap((t) => (t.length <= MAX * 1.5 ? [t] : t.match(new RegExp(`[\\s\\S]{1,${MAX}}`, "g")) ?? [t]));
}

export function chunkText(raw: string): string[] {
  const paras = raw.replace(/\r/g, "").split(/\n\s*\n+/).map((p) => p.replace(/[ \t]+/g, " ").trim()).filter((p) => p.length > 0);
  const chunks: string[] = []; let cur = "";
  const flush = () => { if (cur.trim()) chunks.push(cur.trim()); cur = ""; };
  for (const p of paras) {
    const parts = p.length > MAX ? splitLong(p) : [p];
    for (const part of parts) {
      if (cur && (cur + "\n\n" + part).length > MAX) flush();
      cur = cur ? cur + "\n\n" + part : part;
      if (cur.length >= MIN) flush();
    }
  }
  flush();
  // fold a tiny tail into the previous chunk
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 80) { const t = chunks.pop()!; chunks[chunks.length - 1] += "\n\n" + t; }
  return chunks;
}
