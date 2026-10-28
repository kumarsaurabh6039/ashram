import { Injectable, computed, signal } from '@angular/core';
import { CHATBOT } from './chatbot.config';
import { shrinkImage } from '../core/image.util';

export interface Cat { id: string; hi: string; en: string }
export interface DocMeta {
  id: string; title: string; category: string; kind: 'pdf' | 'image' | 'text'; fileName?: string;
  status: 'processing' | 'ready' | 'failed'; stage?: string; progress?: { done: number; total: number }; error?: string;
  chunkCount: number; charCount: number; createdAt: number; createdBy: string;
}
export interface NewsRow { id: string; title: string; category: string; date: string; excerpt: string; body: string; coverId: string; published: boolean; createdAt: number; updatedAt: number }
export interface PhotoRow { id: string; mediaId: string; caption: string; category: string; createdAt: number }
export interface SearchHit { score: number; title: string; category: string; text: string; used: boolean }

const KEY = 'ac-admin';
export const MAX_MB = 14;

/** Talks to the chatbot server's /api/admin routes. Login happens on the server (Firebase Auth), so no Firebase SDK is needed here. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  email = signal('');
  loggedIn = computed(() => !!this.email());
  docs = signal<DocMeta[]>([]);
  news = signal<NewsRow[]>([]);
  photos = signal<PhotoRow[]>([]);
  cats = signal<Cat[]>([]);
  private idToken = ''; private refreshToken = ''; private exp = 0;

  constructor() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
      if (s?.refreshToken) { this.idToken = s.idToken; this.refreshToken = s.refreshToken; this.exp = s.exp; this.email.set(s.email); }
    } catch { /* ignore */ }
  }

  private persist() { try { sessionStorage.setItem(KEY, JSON.stringify({ idToken: this.idToken, refreshToken: this.refreshToken, exp: this.exp, email: this.email() })); } catch { /* private mode */ } }

  async login(email: string, password: string): Promise<string | null> {
    try {
      const r = await fetch(`${CHATBOT.apiBase}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (!r.ok) return String(j.error ?? 'Login nahi hua.');
      this.idToken = j.idToken; this.refreshToken = j.refreshToken; this.exp = Date.now() + j.expiresIn * 1000; this.email.set(j.email); this.persist();
      return null;
    } catch { return 'Server se connect nahi ho pa raha.'; }
  }

  logout() { this.idToken = this.refreshToken = ''; this.exp = 0; this.email.set(''); this.docs.set([]); this.news.set([]); this.photos.set([]); try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } }

  private async refresh(): Promise<boolean> {
    try {
      const r = await fetch(`${CHATBOT.apiBase}/admin/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: this.refreshToken }) });
      if (!r.ok) return false;
      const j = await r.json(); this.idToken = j.idToken; this.refreshToken = j.refreshToken; this.exp = Date.now() + j.expiresIn * 1000; this.persist(); return true;
    } catch { return false; }
  }

  async api<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (Date.now() > this.exp - 60_000 && !(await this.refresh())) { this.logout(); throw new Error('Session khatam, dobara login karein.'); }
    const go = () => fetch(`${CHATBOT.apiBase}/admin${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.idToken}` }, body: body === undefined ? undefined : JSON.stringify(body) });
    let r = await go();
    if (r.status === 401 && (await this.refresh())) r = await go();
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { this.logout(); throw new Error('Session khatam, dobara login karein.'); }
    if (!r.ok) throw new Error(String(j.error ?? 'Kuch gadbad hui.'));
    return j as T;
  }

  mediaUrl = (id: string) => `${CHATBOT.apiBase}/media/${id}`;
  async loadNews() { this.news.set(await this.api<NewsRow[]>('GET', '/news')); }
  async loadPhotos() { this.photos.set(await this.api<PhotoRow[]>('GET', '/gallery')); }
  saveNews(n: Partial<NewsRow>) { return this.api<NewsRow>('POST', '/news', n); }
  deleteNews(id: string) { return this.api('DELETE', `/news/${id}`); }
  /** Shrinks the photo in the browser, then stores it. Returns the image id. */
  async uploadImage(file: File): Promise<string> {
    const { mime, data } = await shrinkImage(file);
    return (await this.api<{ id: string }>('POST', '/media', { mimeType: mime, data })).id;
  }
  discardImage(id: string) { return this.api('DELETE', `/media/${id}`).catch(() => null); }
  addPhoto(mediaId: string, caption: string, category: string) { return this.api<PhotoRow>('POST', '/gallery', { mediaId, caption, category }); }
  updatePhoto(id: string, caption: string, category: string) { return this.api<PhotoRow>('PATCH', `/gallery/${id}`, { caption, category }); }
  deletePhoto(id: string) { return this.api('DELETE', `/gallery/${id}`); }

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
}
