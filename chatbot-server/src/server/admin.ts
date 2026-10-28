import express, { type NextFunction, type Request, type Response } from "express";
import { adminAuth, firebaseConfigured } from "./firebase.js";
import { CATEGORIES, categoryIds } from "./kb/categories.js";
import { enqueue } from "./kb/process.js";
import { searchKb, minSimilarity } from "./kb/search.js";
import { addPhoto, allNews, allPhotos, deleteMedia, isMediaUsed, MAX_IMAGE_BYTES, patchPhoto, removeNews, removePhoto, saveMedia, sniffImage, upsertNews } from "./content/store.js";
import { deleteDoc, getDoc, listDocs, newDocId, previewChunks, saveDoc, type DocKind, type DocMeta } from "./kb/store.js";

const MAX_MB = Number(process.env.MAX_UPLOAD_MB ?? 14);
const MIMES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const admins = () => (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const webKey = () => process.env.FIREBASE_WEB_API_KEY ?? "";

export const admin = express.Router();
admin.use(express.json({ limit: `${Math.ceil(MAX_MB * 1.4) + 2}mb` }));   // base64 is ~33% larger than the file

// login attempts: 8 per minute per IP
const tries = new Map<string, number[]>();
const throttled = (ip: string) => {
  const now = Date.now(), a = (tries.get(ip) ?? []).filter((t) => now - t < 60_000);
  a.push(now); tries.set(ip, a); return a.length > 8;
};

admin.use((_q, res, next) => {
  if (!firebaseConfigured() || !webKey() || !admins().length)
    return res.status(503).json({ error: "Admin setup poora nahi hai (FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_WEB_API_KEY, ADMIN_EMAILS .env me bharein)." });
  next();
});

admin.post("/login", async (req, res) => {
  if (throttled(req.ip ?? "x")) return res.status(429).json({ error: "Bahut koshishein. Ek minute baad try karein." });
  const email = String(req.body?.email ?? "").trim().toLowerCase(), password = String(req.body?.password ?? "");
  if (!email || !password) return res.status(400).json({ error: "Email aur password likhein." });
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${webKey()}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) {
      const code = String(j?.error?.message ?? "");
      console.warn(`[admin login] Firebase ne ${email} ko mana kiya: ${code}`);
      if (/TOO_MANY_ATTEMPTS/.test(code)) return res.status(429).json({ error: "Bahut koshishein. Thodi der baad try karein." });
      if (/API key not valid|API_KEY|OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/i.test(code))
        return res.status(503).json({ error: "Firebase setup galat hai: FIREBASE_WEB_API_KEY check karein aur Authentication me Email/Password sign-in ON karein." });
      return res.status(401).json({ error: "Email ya password galat hai." });
    }
    // The password is correct at this point, so it is safe to say why access is still refused.
    if (!admins().includes(email)) {
      console.warn(`[admin login] ${email} ka password sahi hai, par ye email ADMIN_EMAILS me nahi hai.`);
      return res.status(403).json({ error: "Password sahi hai, par ye email admin list (ADMIN_EMAILS) me nahi hai. Server ki .env me jodkar server restart karein." });
    }
    res.json({ idToken: j.idToken, refreshToken: j.refreshToken, expiresIn: Number(j.expiresIn), email });
  } catch (e: any) { console.error(e.message); res.status(503).json({ error: "Login abhi nahi ho pa raha." }); }
});

admin.post("/refresh", async (req, res) => {
  try {
    const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${webKey()}`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: String(req.body?.refreshToken ?? "") }),
    });
    const j: any = await r.json();
    if (!r.ok) return res.status(401).json({ error: "Session khatam, dobara login karein." });
    res.json({ idToken: j.id_token, refreshToken: j.refresh_token, expiresIn: Number(j.expires_in) });
  } catch { res.status(503).json({ error: "Session refresh nahi hua." }); }
});

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

// ---------------- website content: images, news, gallery ----------------
admin.post("/media", async (req, res) => {
  try {
    const bytes = Buffer.from(String(req.body?.data ?? ""), "base64");
    const mime = sniffImage(bytes);
    if (!mime) return res.status(400).json({ error: "Sirf JPG, PNG ya WEBP photo chalegi." });
    if (bytes.length > MAX_IMAGE_BYTES) return res.status(400).json({ error: "Photo bahut badi hai." });
    res.json({ id: await saveMedia(bytes, mime) });
  } catch (e: any) { console.error(e.message); res.status(500).json({ error: "Photo save nahi hui." }); }
});
/** Removes an uploaded image that was never attached to anything (e.g. editor cancelled). */
admin.delete("/media/:id", async (req, res) => {
  const id = String(req.params.id);
  try { if (!isMediaUsed(id)) await deleteMedia(id); res.json({ ok: true }); } catch { res.json({ ok: true }); }
});

admin.get("/news", (_q, res) => res.json(allNews()));
admin.post("/news", async (req, res) => {
  try { res.json(await upsertNews(req.body ?? {})); }
  catch (e: any) { res.status(400).json({ error: e.message || "News save nahi hui." }); }
});
admin.delete("/news/:id", async (req, res) => {
  try { await removeNews(String(req.params.id)); res.json({ ok: true }); } catch (e: any) { console.error(e.message); res.status(500).json({ error: "Delete nahi hua." }); }
});

admin.get("/gallery", (_q, res) => res.json(allPhotos()));
admin.post("/gallery", async (req, res) => {
  try { res.json(await addPhoto(String(req.body?.mediaId ?? ""), req.body?.caption, req.body?.category)); }
  catch (e: any) { res.status(400).json({ error: e.message || "Photo save nahi hui." }); }
});
admin.patch("/gallery/:id", async (req, res) => {
  try { res.json(await patchPhoto(String(req.params.id), req.body?.caption, req.body?.category)); }
  catch (e: any) { res.status(400).json({ error: e.message || "Update nahi hua." }); }
});
admin.delete("/gallery/:id", async (req, res) => {
  try { await removePhoto(String(req.params.id)); res.json({ ok: true }); } catch (e: any) { console.error(e.message); res.status(500).json({ error: "Delete nahi hua." }); }
});