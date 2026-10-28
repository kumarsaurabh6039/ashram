import { PDFDocument } from "pdf-lib";
import { geminiPost } from "./gemini.js";

const MODEL = () => process.env.EXTRACT_MODEL ?? "gemini-2.5-flash";
const PAGES_PER_CALL = Number(process.env.PDF_PAGES_PER_CALL ?? 6);

const PROMPT = `You are a transcription (OCR) engine. Transcribe ALL the text in this document exactly as written, in its original language and script (Hindi in Devanagari, English, etc.).
Rules:
- Do NOT translate, summarize, correct, explain or add anything.
- Keep paragraph breaks (blank line between paragraphs) and the line breaks of verses / poems / aarti.
- Keep numbering and headings as they are.
- Skip page numbers and repeated running headers or footers.
- For tables, write each row on one line with " | " between cells.
- If a photo or diagram has no text, add one short line starting with "चित्र:" describing only what is clearly visible, nothing more.
- If there is no readable text at all, output nothing.
Output only the transcription.`;

async function ocrOnce(bytes: Buffer, mime: string): Promise<{ text: string; truncated: boolean }> {
  const data = await geminiPost(`models/${MODEL()}:generateContent`, {
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: mime, data: bytes.toString("base64") } }, { text: PROMPT }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 60000, thinkingConfig: { thinkingBudget: 0 } },
  }, 180_000);
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p: any) => p.text ?? "").join("").trim();
  return { text, truncated: cand?.finishReason === "MAX_TOKENS" };
}

export async function pdfPageCount(bytes: Buffer): Promise<number> {
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return src.getPageCount();
}

/** Extracts one batch of pages (start..end exclusive) of a PDF. */
export async function extractPdfPages(bytes: Buffer, start: number, end: number, total: number): Promise<{ text: string; truncated: boolean }> {
  if (start === 0 && end >= total) return ocrOnce(bytes, "application/pdf");
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const part = await PDFDocument.create();
  const idx = Array.from({ length: end - start }, (_, i) => start + i);
  (await part.copyPages(src, idx)).forEach((p: any) => part.addPage(p));
  return ocrOnce(Buffer.from(await part.save()), "application/pdf");
}

export const extractImage = (bytes: Buffer, mime: string) => ocrOnce(bytes, mime);
export const pagesPerCall = () => PAGES_PER_CALL;
