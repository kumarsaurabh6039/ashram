import { Injectable, computed, signal } from '@angular/core';
import type { User } from 'firebase/auth';
import { CHATBOT } from './chatbot.config';
import { shrinkImage } from '../core/image.util';
import { COL, forgetMedia, fs, getAuthInstance, getDb, mediaDataUrl } from '../core/firebase';

export interface Cat { id: string; hi: string; en: string }
export interface DocMeta {
  id: string; title: string; category: string; kind: 'pdf' | 'image' | 'text'; fileName?: string;
  status: 'processing' | 'ready' | 'failed'; stage?: string; progress?: { done: number; total: number }; error?: string;
  chunkCount: number; charCount: number; createdAt: number; createdBy: string;
}
/** cover = small photo stored inside the news document (data URL). coverId only exists on news saved by the old server version. */
export interface NewsRow { id: string; title: string; category: string; date: string; excerpt: string; body: string; cover: string; coverId?: string; published: boolean; createdAt: number; updatedAt: number }
/** thumb = small preview stored inside the photo document; mediaId = full-size photo in site_media. */
export interface PhotoRow { id: string; mediaId: string; caption: string; category: string; createdAt: number; thumb?: string }
export interface SearchHit { score: number; title: string; category: string; text: string; used: boolean }

const KEY = 'ac-admin';
export const MAX_MB = 14;
const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
const today = () => new Date().toISOString().slice(0, 10);
const code = (e: unknown) => String((e as { code?: string })?.code ?? '');

/**
 * Login, news and photos talk to Firebase directly (no server needed, so they work even when the free server is asleep).
 * Only the chatbot training (documents, search test) still goes to the chatbot server, with the Firebase login token.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  email = signal('');
  loggedIn = computed(() => !!this.email());
  docs = signal<DocMeta[]>([]);
  news = signal<NewsRow[]>([]);
  photos = signal<PhotoRow[]>([]);
  cats = signal<Cat[]>([]);
  private user: User | null = null;
  private authReady?: Promise<void>;

  constructor() {
    try { const e = sessionStorage.getItem(KEY); if (e) { this.email.set(e); void this.initAuth(); } } catch { /* ignore */ }
  }

  private setEmail(e: string) {
    this.email.set(e);
    try { e ? sessionStorage.setItem(KEY, e) : sessionStorage.removeItem(KEY); } catch { /* private mode */ }
  }

  /** Starts Firebase Auth (only for admins) and waits until it knows whether someone is signed in. */
  private initAuth(): Promise<void> {
    return (this.authReady ??= (async () => {
      const [auth, m] = await Promise.all([getAuthInstance(), import('firebase/auth')]);
      await m.setPersistence(auth, m.browserSessionPersistence);
      await new Promise<void>((res) => {
        let first = true;
        m.onAuthStateChanged(auth, (u) => { this.user = u; this.setEmail(u?.email ?? ''); if (first) { first = false; res(); } });
      });
    })().catch((e) => { this.authReady = undefined; throw e; }));
  }

  private loginError(e: unknown): string {
    const c = code(e);
    if (/invalid-credential|wrong-password|user-not-found|invalid-email|missing-password/.test(c)) return 'Email ya password galat hai.';
    if (c === 'auth/too-many-requests') return 'Bahut koshishein. Thodi der baad try karein.';
    if (c === 'auth/network-request-failed') return 'Firebase se connect nahi ho pa raha. Internet check karein.';
    if (/invalid-api-key|api-key-not-valid|operation-not-allowed|requests-from-referer/.test(c)) return 'Firebase setup galat hai: src/app/core/firebase.ts ki apiKey check karein aur Authentication me Email/Password ON karein.';
    return 'Login nahi hua. Dobara try karein.';
  }

  async login(email: string, password: string): Promise<string | null> {
    try {
      await this.initAuth();
      const [auth, m] = await Promise.all([getAuthInstance(), import('firebase/auth')]);
      await m.signInWithEmailAndPassword(auth, email, password);
    } catch (e) { return this.loginError(e); }
    // Who is an admin is decided by firestore.rules. A password that is right but not an admin is refused by this read.
    try { const [db, f] = await Promise.all([getDb(), fs()]); await f.getDocs(f.query(f.collection(db, COL.news), f.limit(1))); }
    catch (e) {
      await this.signOutQuiet(); this.logout();
      return code(e) === 'permission-denied'
        ? 'Password sahi hai, par ye email admin list me nahi hai. firestore.rules me email jodkar Publish karein.'
        : 'Firebase (database) se connect nahi ho pa raha.';
    }
    return null;
  }

  private async signOutQuiet() { try { const [auth, m] = await Promise.all([getAuthInstance(), import('firebase/auth')]); await m.signOut(auth); } catch { /* ignore */ } }
  logout() {
    this.user = null; this.setEmail(''); this.docs.set([]); this.news.set([]); this.photos.set([]);
    if (this.authReady) void this.signOutQuiet();
  }

  private fail(e: unknown, fallback: string): Error {
    if (e instanceof Error && !code(e)) return e;
    const c = code(e);
    if (c === 'permission-denied') return new Error('Permission nahi mili. Dobara login karein ya firestore.rules check karein.');
    if (c === 'unavailable' || c === 'deadline-exceeded') return new Error('Firebase se connect nahi ho pa raha. Internet check karein.');
    return new Error(fallback);
  }

  // ---------------- chatbot server (documents, search test) ----------------
  async api<T>(method: string, path: string, body?: unknown): Promise<T> {
    const call = async (force: boolean) => {
      await this.initAuth();
      if (!this.user) { this.logout(); throw new Error('Session khatam, dobara login karein.'); }
      const token = await this.user.getIdToken(force);
      try {
        return await fetch(`${CHATBOT.apiBase}/admin${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body) });
      } catch { throw new Error('Chatbot server se connect nahi ho pa raha. Free server so raha ho sakta hai, 1 minute baad dobara try karein.'); }
    };
    let r = await call(false);
    if (r.status === 401) r = await call(true);
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { this.logout(); throw new Error('Session khatam, dobara login karein.'); }
    if (!r.ok) throw new Error(String(j.error ?? 'Kuch gadbad hui.'));
    return j as T;
  }

  async loadCats() { if (!this.cats().length) this.cats.set(await this.api<Cat[]>('GET', '/categories')); }
  async loadDocs() { this.docs.set(await this.api<DocMeta[]>('GET', '/docs')); }
  remove(id: string) { return this.api('DELETE', `/docs/${id}`); }
  preview(id: string) { return this.api<{ doc: DocMeta; chunks: string[] }>('GET', `/docs/${id}/preview`); }
  search(q: string) { return this.api<{ threshold: number; hits: SearchHit[] }>('POST', '/search', { q }); }
  addText(title: string, category: string, text: string, note: string) { return this.api<{ id: string }>('POST', '/docs', { title, category, text, note }); }

  async addFile(file: File, title: string, category: string, note: string) {
    const data = await new Promise<string>((res, rej) => {
      const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1] ?? ''); fr.onerror = () => rej(new Error('File padh nahi payi.')); fr.readAsDataURL(file);
    });
    return this.api<{ id: string }>('POST', '/docs', { title, category, note, fileName: file.name, mimeType: file.type, data });
  }

  // ---------------- news (Firestore, direct) ----------------
  async loadNews() {
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const rows = (await f.getDocs(f.collection(db, COL.news))).docs.map((d) => d.data() as NewsRow)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
      this.news.set(rows);
      for (const r of rows) if (r.coverId && !r.cover) void mediaDataUrl(r.coverId).then((u) => { if (u) this.news.update((l) => l.map((x) => (x.id === r.id ? { ...x, cover: u } : x))); });
    } catch (e) { throw this.fail(e, 'News load nahi hui.'); }
  }

  /** Resizes a cover photo in the browser (<= ~110 KB) so it can live inside the news document. */
  async coverFromFile(file: File): Promise<string> { const { mime, data } = await shrinkImage(file, 1000, 110 * 1024); return `data:${mime};base64,${data}`; }

  async saveNews(i: Partial<NewsRow>): Promise<NewsRow> {
    try {
      const title = clip(i.title, 150); if (!title) throw new Error('Title likhiye.');
      const body = clip(i.body, 20000);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(i.date)) ? String(i.date) : today();
      let excerpt = clip(i.excerpt, 300);
      if (!excerpt && body) { const flat = body.replace(/\s+/g, ' '); excerpt = flat.length > 170 ? flat.slice(0, 170).trimEnd() + '…' : flat; }
      const cover = typeof i.cover === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(i.cover) && i.cover.length < 200_000 ? i.cover : '';
      const keepLegacy = !cover && /^[A-Za-z0-9]{1,40}$/.test(String(i.coverId ?? '')) ? String(i.coverId) : '';
      const [db, f] = await Promise.all([getDb(), fs()]);
      const ref = i.id ? f.doc(db, COL.news, String(i.id)) : f.doc(f.collection(db, COL.news));
      let old: NewsRow | undefined;
      if (i.id) { const s = await f.getDoc(ref); if (!s.exists()) throw new Error('News nahi mili.'); old = s.data() as NewsRow; }
      const now = Date.now();
      const item = { id: ref.id, title, category: clip(i.category, 40), date, excerpt, body, cover, ...(keepLegacy ? { coverId: keepLegacy } : {}), published: i.published !== false, createdAt: old?.createdAt ?? now, updatedAt: now };
      await f.setDoc(ref, item);
      if (old?.coverId && old.coverId !== keepLegacy) await this.dropMedia(old.coverId);
      return item as NewsRow;
    } catch (e) { throw this.fail(e, 'News save nahi hui.'); }
  }

  async deleteNews(id: string) {
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const ref = f.doc(db, COL.news, id), s = await f.getDoc(ref);
      const legacy = s.exists() ? (s.data() as NewsRow).coverId : '';
      await f.deleteDoc(ref);
      if (legacy) await this.dropMedia(legacy);
    } catch (e) { throw this.fail(e, 'Delete nahi hua.'); }
  }

  private async dropMedia(id: string) {
    try { const [db, f] = await Promise.all([getDb(), fs()]); await f.deleteDoc(f.doc(db, COL.media, id)); forgetMedia(id); } catch { /* already gone */ }
  }

  // ---------------- photos (Firestore, direct) ----------------
  async loadPhotos() {
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const rows = (await f.getDocs(f.collection(db, COL.gallery))).docs.map((d) => d.data() as PhotoRow).sort((a, b) => b.createdAt - a.createdAt);
      this.photos.set(rows);
      for (const r of rows) if (!r.thumb) void mediaDataUrl(r.mediaId).then((u) => { if (u) this.photos.update((l) => l.map((x) => (x.id === r.id ? { ...x, thumb: u } : x))); });
    } catch (e) { throw this.fail(e, 'Photos load nahi hui.'); }
  }

  /** Browser shrinks the photo twice: a small preview (stored in the photo document) and the full-size copy (site_media). */
  async uploadPhoto(file: File, caption: string, category: string): Promise<PhotoRow> {
    const full = await shrinkImage(file);
    const small = await shrinkImage(file, 480, 60 * 1024);
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const mref = f.doc(f.collection(db, COL.media));
      await f.setDoc(mref, { mime: full.mime, bytes: f.Bytes.fromBase64String(full.data), size: Math.floor(full.data.length * 0.75), createdAt: Date.now() });
      const gref = f.doc(f.collection(db, COL.gallery));
      const item: PhotoRow = { id: gref.id, mediaId: mref.id, caption: clip(caption, 160), category: clip(category, 40) || 'Other', createdAt: Date.now(), thumb: `data:${small.mime};base64,${small.data}` };
      try { await f.setDoc(gref, item); } catch (e) { await f.deleteDoc(mref).catch(() => {}); throw e; }
      return item;
    } catch (e) { throw this.fail(e, 'Photo save nahi hui.'); }
  }

  async updatePhoto(id: string, caption: string, category: string) {
    try { const [db, f] = await Promise.all([getDb(), fs()]); await f.updateDoc(f.doc(db, COL.gallery, id), { caption: clip(caption, 160), category: clip(category, 40) || 'Other' }); }
    catch (e) { throw this.fail(e, 'Update nahi hua.'); }
  }

  async deletePhoto(id: string) {
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const ref = f.doc(db, COL.gallery, id), s = await f.getDoc(ref);
      const mediaId = s.exists() ? String((s.data() as PhotoRow).mediaId ?? '') : '';
      await f.deleteDoc(ref);
      if (mediaId) await this.dropMedia(mediaId);
    } catch (e) { throw this.fail(e, 'Delete nahi hua.'); }
  }
}