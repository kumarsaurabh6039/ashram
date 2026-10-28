import express from "express";
import { allNews, allPhotos, findNews, getMedia, whenContentLoaded } from "./content/store.js";
import { firebaseConfigured } from "./firebase.js";

/** Read-only endpoints used by the public website (no login). */
export const publicApi = express.Router();

// 600 requests / minute / IP is plenty for page loads with many thumbnails
const hits = new Map<string, number[]>();
publicApi.use((req, res, next) => {
  const ip = req.ip ?? "x", now = Date.now();
  const a = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (a.length >= 600) return res.status(429).json({ error: "Too many requests." });
  a.push(now); hits.set(ip, a); next();
});

publicApi.get("/public/news", async (_q, res) => {
  if (!firebaseConfigured()) return res.json([]);
  await whenContentLoaded();
  res.set("Cache-Control", "no-cache");
  res.json(allNews().filter((n) => n.published).slice(0, 200).map(({ body, ...rest }) => rest));
});
publicApi.get("/public/news/:id", async (req, res) => {
  if (!firebaseConfigured()) return res.status(404).json({ error: "Not found" });
  await whenContentLoaded();
  const n = findNews(String(req.params.id));
  if (!n || !n.published) return res.status(404).json({ error: "Not found" });
  res.set("Cache-Control", "no-cache"); res.json(n);
});
publicApi.get("/public/gallery", async (_q, res) => {
  if (!firebaseConfigured()) return res.json([]);
  await whenContentLoaded();
  res.set("Cache-Control", "no-cache");
  res.json(allPhotos().slice(0, 400).map(({ id, mediaId, caption, category }) => ({ id, mediaId, caption, category })));
});

/** Images never change once saved, so browsers may keep them for a year. */
publicApi.get("/media/:id", async (req, res) => {
  try {
    if (!firebaseConfigured()) return res.status(404).end();
    const m = await getMedia(String(req.params.id));
    if (!m) return res.status(404).end();
    res.set({ "Content-Type": m.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "cross-origin" });
    res.send(m.bytes);
  } catch (e: any) { console.error(e.message); res.status(500).end(); }
});
