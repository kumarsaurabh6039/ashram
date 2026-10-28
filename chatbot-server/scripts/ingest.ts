/**
 * Usage: npx tsx scripts/ingest.ts <textfile> "<Source name>" [idPrefix]
 * Splits a clean Hindi/English text into ~600 char chunks and APPENDS them
 * to src/data/knowledge.json as verified entries (verbatim text).
 */
import { readFileSync, writeFileSync } from "node:fs";

const [file, source, prefix = "D"] = process.argv.slice(2);
if (!file || !source) { console.error('Usage: tsx scripts/ingest.ts <file> "<source>" [prefix]'); process.exit(1); }

const KB_PATH = "src/data/knowledge.json";
const kb = JSON.parse(readFileSync(KB_PATH, "utf8"));

const raw = readFileSync(file, "utf8")
  .split("\n")
  .filter((l) => !/^[A-Za-z0-9+/=]{60,}$/.test(l.trim()))                      // drop base64 image lines
  .join("\n");

const cleanPara = (p: string) =>
  p.replace(/[*'"“”]/g, " ").replace(/अघोरेश्वर संवेदनशील|अघोर\s+वचन/g, " ")
   .replace(/सूचना|चैनल से कापी करने वालो|पोस्ट पर चैनल का नाम|लिख दिया करे/g, " ")
   .replace(/\s+/g, " ").trim();

const paras = raw.split(/\n\s*\n+/).map(cleanPara).filter((p) => p.length > 40);
const seen = new Set<string>();
const chunks: string[] = [];
for (const p of paras) {
  // split long paragraphs on danda / full stop at ~600 chars
  const sents = p.split(/(?<=[।.!?])\s+/);
  let cur = "";
  for (const s of sents) {
    if ((cur + " " + s).length > 600 && cur) { chunks.push(cur.trim()); cur = s; } else cur += " " + s;
  }
  if (cur.trim()) chunks.push(cur.trim());
}

const STOP = new Set("और का की के है हैं में से को पर यह वह जो कि तो भी ही न नहीं एक इस उस लिए करने होता होती हो कर तुम आप हम मैं तूॅं".split(" "));
let n = kb.filter((e: any) => String(e.id).startsWith(prefix)).length;
let added = 0;
for (const c of chunks) {
  const key = c.slice(0, 80);
  if (seen.has(key) || kb.some((e: any) => e.hi.includes(key))) continue;   // de-duplicate repeated paragraphs
  seen.add(key);
  const freq = new Map<string, number>();
  for (const w of c.split(/[^\p{L}\p{M}]+/u)) if (w.length > 2 && !STOP.has(w)) freq.set(w, (freq.get(w) ?? 0) + 1);
  const tags = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
  kb.push({ id: `${prefix}${++n}`, source, verified: true, tags, hi: c, en: "" });
  added++;
}
writeFileSync(KB_PATH, JSON.stringify(kb, null, 1));
console.log(`Added ${added} chunks (${chunks.length} candidates). Total entries: ${kb.length}`);
