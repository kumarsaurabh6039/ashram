import { chunkText } from "./chunk.js";
import { embedTexts } from "./embed.js";
import { extractImage, extractPdfPages, pagesPerCall, pdfPageCount } from "./extract.js";
import { patchDoc, saveChunks, type DocMeta } from "./store.js";

export type Input = { kind: "file"; bytes: Buffer; mime: string } | { kind: "text"; text: string };

// documents are processed one at a time so the free Gemini rate limits are respected
let chain: Promise<unknown> = Promise.resolve();
export function enqueue(doc: DocMeta, input: Input): void {
  chain = chain.then(() => run(doc, input)).catch((e) => console.error("queue error", e));
}

async function run(doc: DocMeta, input: Input): Promise<void> {
  try {
    let text = "", warn = "";
    if (input.kind === "text") text = input.text;
    else if (input.mime === "application/pdf") {
      const total = await pdfPageCount(input.bytes), step = pagesPerCall();
      const parts: string[] = [];
      for (let s = 0; s < total; s += step) {
        await patchDoc(doc.id, { stage: "reading", progress: { done: s, total } });
        const r = await extractPdfPages(input.bytes, s, Math.min(s + step, total), total);
        if (r.truncated) warn += ` Pages ${s + 1}-${Math.min(s + step, total)} adhure ho sakte hain.`;
        if (r.text) parts.push(r.text);
      }
      text = parts.join("\n\n");
    } else {
      await patchDoc(doc.id, { stage: "reading", progress: { done: 0, total: 1 } });
      const r = await extractImage(input.bytes, input.mime); text = r.text;
      if (r.truncated) warn = " Text adhura ho sakta hai.";
    }
    if (doc.note?.trim()) text = `${doc.note.trim()}\n\n${text}`;
    text = text.trim();
    if (text.length < 20) throw new Error("Isme se koi padhne layak text nahi mila.");

    const chunks = chunkText(text);
    await patchDoc(doc.id, { stage: "embedding", progress: { done: 0, total: chunks.length } });
    // the title is part of what gets embedded so "Donation" / "Ashram" style questions match their documents
    const vecs = await embedTexts(chunks.map((c) => `${doc.title}\n${c}`), "RETRIEVAL_DOCUMENT");
    await patchDoc(doc.id, { stage: "saving" });
    await saveChunks(doc, chunks, vecs);
    await patchDoc(doc.id, { status: "ready", stage: "done", chunkCount: chunks.length, charCount: text.length, error: warn.trim() || "" });
  } catch (e: any) {
    console.error(`process ${doc.id} failed:`, e.message);
    await patchDoc(doc.id, { status: "failed", error: String(e.message).slice(0, 300) }).catch(() => {});
  }
}
