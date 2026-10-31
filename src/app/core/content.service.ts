import { Injectable, computed, signal } from '@angular/core';
import { NEWS } from './content';
import { COL, fs, getDb, mediaDataUrl } from './firebase';
import { GalleryImage, NewsArticle } from './models';

interface FsNews { id: string; title: string; category?: string; date?: string; excerpt?: string; body?: string; cover?: string; coverId?: string; createdAt?: number }
interface FsPhoto { id: string; mediaId: string; caption?: string; category?: string; thumb?: string; createdAt?: number }

const fmtDate = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso + 'T00:00:00');
  return isNaN(+d) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};
const toArticle = (n: FsNews): NewsArticle => ({
  slug: n.id, title: n.title, excerpt: n.excerpt ?? '', excerptIncomplete: false,
  date: fmtDate(n.date), category: n.category || undefined, image: n.cover || undefined, body: n.body,
});
const toImage = (p: FsPhoto, src: string): GalleryImage => ({ src, alt: p.caption || `${p.category || 'Ashram'} photograph`, caption: p.caption || undefined, category: p.category || undefined });

/** News and photographs managed from the admin dashboard. They are read straight from Firestore, so no server has to be awake. */
@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private dynNews = signal<NewsArticle[]>([]);
  newsLoaded = signal(false);
  galleryLoaded = signal(false);
  gallery = signal<GalleryImage[]>([]);
  private waited = signal(false);
  private started = false;
  private mediaOf = new Map<string, string>();   // preview image -> full-size photo id

  /** Built-in articles are only a fallback for when nothing has been published from the dashboard yet. */
  news = computed(() => {
    if (this.dynNews().length) return this.dynNews();
    return this.newsLoaded() || this.waited() ? NEWS : [];
  });

  start() {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    setTimeout(() => this.waited.set(true), 6000);
    void this.refresh();
  }

  async refresh() {
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const [n, g] = await Promise.all([
        f.getDocs(f.query(f.collection(db, COL.news), f.where('published', '==', true), f.limit(100))),
        f.getDocs(f.query(f.collection(db, COL.gallery), f.limit(400))),
      ]);
      const news = n.docs.map((d) => d.data() as FsNews)
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || (b.createdAt ?? 0) - (a.createdAt ?? 0));
      this.dynNews.set(news.map(toArticle));
      // news saved by the old server version kept the cover as a separate photo
      for (const r of news) if (r.coverId && !r.cover) void mediaDataUrl(r.coverId).then((u) => { if (u) this.dynNews.update((l) => l.map((x) => (x.slug === r.id ? { ...x, image: u } : x))); });

      const photos = g.docs.map((d) => d.data() as FsPhoto).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      this.mediaOf.clear();
      const shown: GalleryImage[] = [];
      for (const p of photos) if (p.thumb) { this.mediaOf.set(p.thumb, p.mediaId); shown.push(toImage(p, p.thumb)); }
      this.gallery.set(shown);
      // photos uploaded by the old server version have no preview yet: load the full photo for them
      for (const p of photos) if (!p.thumb) void mediaDataUrl(p.mediaId).then((u) => {
        if (!u) return;
        this.mediaOf.set(u, p.mediaId);
        this.gallery.update((l) => [...l, toImage(p, u)]);
      });
    } catch { /* offline or rules not published: the built-in content stays */ }
    this.newsLoaded.set(true);
    this.galleryLoaded.set(true);
  }

  /** Full-size photo for the lightbox (the grid only holds small previews). */
  async full(g: GalleryImage): Promise<string> {
    const id = this.mediaOf.get(g.src);
    return (id && (await mediaDataUrl(id))) || g.src;
  }

  async loadArticle(id: string): Promise<NewsArticle | undefined> {
    const known = this.dynNews().find((n) => n.slug === id);
    if (known?.body !== undefined) return known;
    try {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const s = await f.getDoc(f.doc(db, COL.news, id));
      const d = s.exists() ? (s.data() as FsNews & { published?: boolean }) : undefined;
      return d && d.published !== false ? toArticle(d) : undefined;
    } catch { return undefined; }
  }
}