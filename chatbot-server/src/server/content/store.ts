import { db } from "../firebase.js";

export interface NewsItem {
  id: string; title: string; category: string; date: string; excerpt: string; body: string;
  coverId: string; published: boolean; createdAt: number; updatedAt: number;
}
export interface PhotoItem { id: string; mediaId: string; caption: string; category: string; createdAt: number }

const NEWS = "site_news", GALLERY = "site_gallery", MEDIA = "site_media";
let news: NewsItem[] = [];
let photos: PhotoItem[] = [];

export const allNews = () => [...news].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
export const allPhotos = () => [...photos].sort((a, b) => b.createdAt - a.createdAt);
export const findNews = (id: string) => news.find((n) => n.id === id);

export async function loadContent(): Promise<void> {
  const [n, g] = await Promise.all([db().collection(NEWS).get(), db().collection(GALLERY).get()]);
  news = n.docs.map((d: any) => d.data() as NewsItem);
  photos = g.docs.map((d: any) => d.data() as PhotoItem);
}
/** Public pages wait for this (max 20 s) so a cold start never shows "no news" just because data is still loading. */
let loading: Promise<void> = Promise.resolve();
export const startContentLoading = () => { loading = loadContent(); return loading; };
export const whenContentLoaded = () => Promise.race([loading.catch(() => {}), new Promise<void>((r) => setTimeout(r, 20_000))]);

const today = () => new Date().toISOString().slice(0, 10);
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export interface NewsInput { id?: string; title?: unknown; category?: unknown; date?: unknown; excerpt?: unknown; body?: unknown; coverId?: unknown; published?: unknown }

export async function upsertNews(i: NewsInput): Promise<NewsItem> {
  const old = i.id ? findNews(String(i.id)) : undefined;
  if (i.id && !old) throw new Error("News nahi mili.");
  const title = clip(i.title, 150);
  if (!title) throw new Error("Title likhiye.");
  const body = clip(i.body, 20000);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(i.date)) ? String(i.date) : today();
  let excerpt = clip(i.excerpt, 300);
  if (!excerpt && body) { const flat = body.replace(/\s+/g, " "); excerpt = flat.length > 170 ? flat.slice(0, 170).trimEnd() + "…" : flat; }
  const coverId = /^[A-Za-z0-9]{1,40}$/.test(String(i.coverId ?? "")) ? String(i.coverId) : "";
  const now = Date.now();
  const ref = old ? db().collection(NEWS).doc(old.id) : db().collection(NEWS).doc();
  const item: NewsItem = {
    id: ref.id, title, category: clip(i.category, 40), date, excerpt, body, coverId,
    published: i.published !== false, createdAt: old?.createdAt ?? now, updatedAt: now,
  };
  await ref.set(item);
  news = [...news.filter((n) => n.id !== item.id), item];
  if (old?.coverId && old.coverId !== coverId) await deleteMedia(old.coverId).catch(() => {});
  return item;
}

export async function removeNews(id: string): Promise<void> {
  const old = findNews(id); if (!old) return;
  await db().collection(NEWS).doc(id).delete();
  news = news.filter((n) => n.id !== id);
  if (old.coverId) await deleteMedia(old.coverId).catch(() => {});
}

export async function addPhoto(mediaId: string, caption: unknown, category: unknown): Promise<PhotoItem> {
  if (!/^[A-Za-z0-9]{1,40}$/.test(mediaId)) throw new Error("Photo id galat hai.");
  const ref = db().collection(GALLERY).doc();
  const item: PhotoItem = { id: ref.id, mediaId, caption: clip(caption, 160), category: clip(category, 40) || "Other", createdAt: Date.now() };
  await ref.set(item); photos = [...photos, item]; return item;
}
export async function patchPhoto(id: string, caption: unknown, category: unknown): Promise<PhotoItem> {
  const old = photos.find((p) => p.id === id); if (!old) throw new Error("Photo nahi mili.");
  const item: PhotoItem = { ...old, caption: clip(caption, 160), category: clip(category, 40) || old.category };
  await db().collection(GALLERY).doc(id).set(item); photos = photos.map((p) => (p.id === id ? item : p)); return item;
}
export async function removePhoto(id: string): Promise<void> {
  const old = photos.find((p) => p.id === id); if (!old) return;
  await db().collection(GALLERY).doc(id).delete();
  photos = photos.filter((p) => p.id !== id);
  await deleteMedia(old.mediaId).catch(() => {});
}

// ---- images: stored as bytes in Firestore (no Firebase Storage / billing needed). The browser shrinks them to < 900 KB first. ----
export const MAX_IMAGE_BYTES = 900 * 1024;
const cache = new Map<string, { mime: string; bytes: Buffer }>();   // small in-memory LRU so repeat views cost no Firestore reads
let cacheBytes = 0;
const CACHE_LIMIT = 40 * 1024 * 1024;
function remember(id: string, v: { mime: string; bytes: Buffer }) {
  cache.delete(id); cache.set(id, v); cacheBytes += v.bytes.length;
  for (const [k, x] of cache) { if (cacheBytes <= CACHE_LIMIT) break; cache.delete(k); cacheBytes -= x.bytes.length; }
}

export function sniffImage(b: Buffer): string | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

export async function saveMedia(bytes: Buffer, mime: string): Promise<string> {
  const ref = db().collection(MEDIA).doc();
  await ref.set({ mime, bytes, size: bytes.length, createdAt: Date.now() });
  remember(ref.id, { mime, bytes }); return ref.id;
}
export async function getMedia(id: string): Promise<{ mime: string; bytes: Buffer } | null> {
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return null;
  const hit = cache.get(id); if (hit) { remember(id, hit); return hit; }
  const s = await db().collection(MEDIA).doc(id).get();
  if (!s.exists) return null;
  const d = s.data(); const v = { mime: String(d.mime), bytes: Buffer.from(d.bytes) };
  remember(id, v); return v;
}
export async function deleteMedia(id: string): Promise<void> {
  const c = cache.get(id); if (c) { cacheBytes -= c.bytes.length; cache.delete(id); }
  await db().collection(MEDIA).doc(id).delete();
}
export const isMediaUsed = (id: string) => news.some((n) => n.coverId === id) || photos.some((p) => p.mediaId === id);
