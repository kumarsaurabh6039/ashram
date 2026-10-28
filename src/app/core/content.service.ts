import { Injectable, computed, signal } from '@angular/core';
import { CHATBOT } from '../chatbot/chatbot.config';
import { NEWS } from './content';
import { GalleryImage, NewsArticle } from './models';

interface ApiNews { id: string; title: string; category?: string; date?: string; excerpt?: string; body?: string; coverId?: string }
interface ApiPhoto { id: string; mediaId: string; caption?: string; category?: string }

const media = (id?: string) => (id ? `${CHATBOT.apiBase}/media/${id}` : undefined);
const fmtDate = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso + 'T00:00:00');
  return isNaN(+d) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};
const toArticle = (n: ApiNews): NewsArticle => ({
  slug: n.id, title: n.title, excerpt: n.excerpt ?? '', excerptIncomplete: false,
  date: fmtDate(n.date), category: n.category || undefined, image: media(n.coverId), body: n.body,
});

/** News and photographs managed from the admin dashboard. The server may be asleep on free hosting, so the page shows the built-in news after a few seconds instead of waiting. */
@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private dynNews = signal<NewsArticle[]>([]);
  newsLoaded = signal(false);
  galleryLoaded = signal(false);
  gallery = signal<GalleryImage[]>([]);
  private waited = signal(false);
  private started = false;

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
    const get = async <T>(path: string, opt: RequestInit = {}): Promise<T | null> => {
      try { const r = await fetch(`${CHATBOT.apiBase}${path}`, { cache: 'no-cache', ...opt }); return r.ok ? ((await r.json()) as T) : null; }
      catch { return null; }
    };
    const [n, g] = await Promise.all([get<ApiNews[]>('/public/news'), get<ApiPhoto[]>('/public/gallery')]);
    if (n) this.dynNews.set(n.map(toArticle));
    this.newsLoaded.set(true);
    if (g) this.gallery.set(g.map((p) => ({ src: media(p.mediaId)!, alt: p.caption || `${p.category || 'Ashram'} photograph`, caption: p.caption || undefined, category: p.category || undefined })));
    this.galleryLoaded.set(true);
  }

  async loadArticle(id: string): Promise<NewsArticle | undefined> {
    const known = this.dynNews().find((n) => n.slug === id);
    if (known?.body !== undefined) return known;
    try {
      const r = await fetch(`${CHATBOT.apiBase}/public/news/${encodeURIComponent(id)}`, { cache: 'no-cache' });
      return r.ok ? toArticle((await r.json()) as ApiNews) : undefined;
    } catch { return undefined; }
  }
}
