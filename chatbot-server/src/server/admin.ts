import express, { type NextFunction, type Request, type Response } from "express";
import { adminAuth, firebaseConfigured } from "./firebase.js";
import { CATEGORIES, categoryIds } from "./kb/categories.js";
import { enqueue } from "./kb/process.js";
import { searchKb, minSimilarity } from "./kb/search.js";
import { deleteDoc, getDoc, listDocs, newDocId, previewChunks, saveDoc, type DocKind, type DocMeta } from "./kb/store.js";

const MAX_MB = Number(process.env.MAX_UPLOAD_MB ?? 14);
const MIMES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const admins = () => (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

export const admin = express.Router();
admin.use(express.json({ limit: `${Math.ceil(MAX_MB * 1.4) + 2}mb` }));   // base64 is ~33% larger than the file

admin.use((_q, res, next) => {
  if (!firebaseConfigured() || !admins().length)
    return res.status(503).json({ error: "Admin setup poora nahi hai (FIREBASE_SERVICE_ACCOUNT_JSON ya _PATH aur ADMIN_EMAILS .env me bharein)." });
  next();
});

// Login, news and photos now happen in the browser directly with Firebase. This server only checks the Firebase login token
// (sent as "Authorization: Bearer ...") before it lets an admin manage the chatbot documents.
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization ?? "";
  try {
    const t = await adminAuth().verifyIdToken(h.startsWith("Bearer ") ? h.slice(7) : "");
    const email = (t.email ?? "").toLowerCase();
    if (!admins().includes(email)) return res.status(403).json({ error: "Aapke paas admin access nahi hai." });
    (req as any).adminEmail = email; next();
  } catch { res.status(401).json({ error: "Login zaruri hai." }); }
}
admin.use(requireAdmin);

admin.get("/categories", (_q, res) => res.json(CATEGORIES));
admin.get("/docs", async (_q, res) => { try { res.json(await listDocs()); } catch (e: any) { console.error(e.message); res.status(500).json({ error: "List load nahi hui." }); } });

admin.get("/docs/:id/preview", async (req, res) => {
  const id = String(req.params.id); const d = await getDoc(id);
  if (!d) return res.status(404).json({ error: "Nahi mila." });
  res.json({ doc: d, chunks: previewChunks(id, 3) });
});

admin.post("/docs", async (req, res) => {
  const b = req.body ?? {};
  const category = categoryIds.includes(b.category) ? String(b.category) : "";
  const title = String(b.title ?? "").trim().slice(0, 120);
  const note = String(b.note ?? "").trim().slice(0, 20000);
  if (!category) return res.status(400).json({ error: "Category chuniye." });
  if (!title) return res.status(400).json({ error: "Title likhiye." });

  const base = { id: newDocId(), title, category, status: "processing" as const, stage: "queued", chunkCount: 0, charCount: 0, createdAt: Date.now(), createdBy: (req as any).adminEmail as string, ...(note ? { note } : {}) };
  try {
    if (b.text !== undefined) {                           // typed note (e.g. donation details)
      const text = String(b.text).trim().slice(0, 100000);
      if (text.length < 20) return res.status(400).json({ error: "Text bahut chhota hai." });
      const doc: DocMeta = { ...base, kind: "text" };
      await saveDoc(doc); enqueue(doc, { kind: "text", text }); return res.json({ id: doc.id });
    }
    const mime = String(b.mimeType ?? ""), data = String(b.data ?? "");
    if (!MIMES.includes(mime)) return res.status(400).json({ error: "Sirf PDF, PNG, JPG ya WEBP chalega." });
    const bytes = Buffer.from(data, "base64");
    if (!bytes.length || bytes.length > MAX_MB * 1024 * 1024) return res.status(400).json({ error: `File ${MAX_MB} MB se chhoti honi chahiye.` });
    const kind: DocKind = mime === "application/pdf" ? "pdf" : "image";
    const doc: DocMeta = { ...base, kind, fileName: String(b.fileName ?? "").slice(0, 200) };
    await saveDoc(doc); enqueue(doc, { kind: "file", bytes, mime }); res.json({ id: doc.id });
  } catch (e: any) { console.error(e.message); res.status(500).json({ error: "Upload save nahi hua." }); }
});

admin.delete("/docs/:id", async (req, res) => {
  try { await deleteDoc(String(req.params.id)); res.json({ ok: true }); }
  catch (e: any) { console.error(e.message); res.status(500).json({ error: "Delete nahi hua." }); }
});

/** Shows what the chatbot would retrieve for a question, with scores - for checking answers and tuning MIN_SIMILARITY. */
admin.post("/search", async (req, res) => {
  const q = String(req.body?.q ?? "").slice(0, 300);
  const hits = await searchKb(q, 6, 0);
  res.json({ threshold: minSimilarity(), hits: hits.map((h) => ({ score: Number(h.score.toFixed(3)), title: h.chunk.title, category: h.chunk.category, text: h.chunk.text.slice(0, 280), used: h.score >= minSimilarity() })) });
});