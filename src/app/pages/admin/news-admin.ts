import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminService, NewsRow } from '../../chatbot/admin.service';
import { NEWS_CATEGORIES } from '../../core/content';
import { SiteContentService } from '../../core/content.service';

interface Draft { id?: string; title: string; category: string; date: string; excerpt: string; body: string; coverId: string; published: boolean }
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Draft => ({ title: '', category: '', date: today(), excerpt: '', body: '', coverId: '', published: true });

@Component({
  selector: 'app-news-admin',
  template: `
  @if (!editing()) {
    <div class="dx-bar"><p class="dx-hint">News save karte hi website par dikhti hai.</p><button type="button" class="dx-btn" (click)="add()">＋ Nayi News</button></div>
    @if (msg()) { <p [class]="bad() ? 'dx-err' : 'dx-ok'" role="status">{{ msg() }}</p> }
    @for (n of ad.news(); track n.id) {
      <article class="dx-row">
        <div class="th">@if (n.coverId) { <img [src]="ad.mediaUrl(n.coverId)" alt="" loading="lazy"> } @else { <span aria-hidden="true">ॐ</span> }</div>
        <div class="in">
          <h3>{{ n.title }}</h3>
          <p class="dx-meta">{{ fmt(n.date) }}@if (n.category) { · {{ n.category }} } <span class="dx-badge" [attr.data-s]="n.published ? 'ready' : 'draft'">{{ n.published ? 'Published' : 'Draft' }}</span></p>
          <div class="dx-acts">
            <button type="button" class="dx-sm" (click)="edit(n)">Edit</button>
            <button type="button" class="dx-sm" (click)="toggle(n)">{{ n.published ? 'Unpublish' : 'Publish' }}</button>
            <button type="button" class="dx-sm del" (click)="remove(n)">Delete</button>
          </div>
        </div>
      </article>
    } @empty { <div class="dx-empty">Abhi koi news nahi hai. “Nayi News” se pehli news likhein.</div> }
  } @else {
    <form class="dx-card dx-form" (submit)="$event.preventDefault(); save()">
      <h2>{{ d().id ? 'News edit karein' : 'Nayi News' }}</h2>
      <label class="dx-field">Title / शीर्षक *
        <input type="text" maxlength="150" required [value]="d().title" (input)="set('title', $any($event.target).value)"></label>
      <div class="dx-two">
        <label class="dx-field">Category
          <input type="text" list="newscats" maxlength="40" placeholder="जैसे: Guru Purnima" [value]="d().category" (input)="set('category', $any($event.target).value)">
          <datalist id="newscats">@for (c of cats; track c) { <option [value]="c"></option> }</datalist></label>
        <label class="dx-field">Date / तारीख
          <input type="date" [value]="d().date" (input)="set('date', $any($event.target).value)"></label>
      </div>
      <div class="dx-field">Cover photo (optional)
        @if (d().coverId) {
          <div class="cov"><img [src]="ad.mediaUrl(d().coverId)" alt="Cover preview"><button type="button" class="dx-sm del" (click)="dropCover()">Hatayein</button></div>
        }
        <input type="file" accept="image/jpeg,image/png,image/webp" (change)="pick($event)" [disabled]="up()">
        @if (up()) { <span class="dx-hint">Photo chhoti karke upload ho rahi hai…</span> }
      </div>
      <label class="dx-field">Short summary (optional)
        <textarea rows="2" maxlength="300" placeholder="Khaali chhodein to full article ke shuru se apne aap ban jayegi" [value]="d().excerpt" (input)="set('excerpt', $any($event.target).value)"></textarea></label>
      <label class="dx-field">Full article / पूरा समाचार
        <textarea rows="12" maxlength="20000" placeholder="Poora samachar yahan likhein. Alag paragraph ke liye beech me ek khaali line chhodein." [value]="d().body" (input)="set('body', $any($event.target).value)"></textarea></label>
      <label class="dx-check"><input type="checkbox" [checked]="d().published" (change)="set('published', $any($event.target).checked)"> Published (website par dikhe)</label>
      @if (msg()) { <p [class]="bad() ? 'dx-err' : 'dx-ok'" role="status">{{ msg() }}</p> }
      <div class="dx-acts">
        <button type="submit" class="dx-btn" [disabled]="busy() || up()">{{ busy() ? 'Save ho raha hai…' : 'Save karein' }}</button>
        <button type="button" class="dx-btn ghost" (click)="cancel()" [disabled]="busy()">Cancel</button>
      </div>
    </form>
  }`,
  styles: [`.cov{display:flex;align-items:flex-end;gap:.8rem;margin-bottom:.4rem}.cov img{width:200px;max-width:60%;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--gold)}`],
})
export class NewsAdminComponent implements OnInit {
  ad = inject(AdminService);
  private content = inject(SiteContentService);
  cats = NEWS_CATEGORIES;
  editing = signal(false); d = signal<Draft>(blank());
  busy = signal(false); up = signal(false); msg = signal(''); bad = signal(false);
  private original = '';

  ngOnInit() { void this.load(); }
  private async load() { try { await this.ad.loadNews(); } catch (e) { this.say((e as Error).message, true); } }
  private say(m: string, bad = false) { this.msg.set(m); this.bad.set(bad); }
  set<K extends keyof Draft>(k: K, v: Draft[K]) { this.d.update((x) => ({ ...x, [k]: v })); }
  fmt = (iso: string) => { const t = new Date(iso + 'T00:00:00'); return isNaN(+t) ? iso : t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };

  add() { this.d.set(blank()); this.original = ''; this.msg.set(''); this.editing.set(true); }
  edit(n: NewsRow) { this.d.set({ id: n.id, title: n.title, category: n.category, date: n.date, excerpt: n.excerpt, body: n.body, coverId: n.coverId, published: n.published }); this.original = n.coverId; this.msg.set(''); this.editing.set(true); }
  cancel() { this.dropUnsaved(); this.editing.set(false); this.msg.set(''); }
  /** A cover uploaded in this editor but never saved would stay behind as clutter, so remove it. */
  private dropUnsaved() { const c = this.d().coverId; if (c && c !== this.original) void this.ad.discardImage(c); }

  async pick(e: Event) {
    const el = e.target as HTMLInputElement, f = el.files?.[0]; if (!f) return;
    this.up.set(true); this.msg.set('');
    try { const id = await this.ad.uploadImage(f); this.dropUnsaved(); this.set('coverId', id); }
    catch (err) { this.say((err as Error).message, true); }
    this.up.set(false); el.value = '';
  }
  dropCover() { this.dropUnsaved(); this.set('coverId', ''); }

  async save() {
    if (!this.d().title.trim()) return this.say('Title likhiye.', true);
    this.busy.set(true); this.msg.set('');
    try {
      await this.ad.saveNews(this.d()); await this.ad.loadNews(); void this.content.refresh();
      this.editing.set(false); this.say('✓ News save ho gayi.');
    } catch (e) { this.say((e as Error).message, true); }
    this.busy.set(false);
  }
  async toggle(n: NewsRow) {
    try { await this.ad.saveNews({ ...n, published: !n.published }); await this.ad.loadNews(); void this.content.refresh(); this.say(n.published ? 'Unpublish ho gayi (draft).' : '✓ Publish ho gayi.'); }
    catch (e) { this.say((e as Error).message, true); }
  }
  async remove(n: NewsRow) {
    if (!confirm(`"${n.title}" delete karein? Ye wapas nahi aayegi.`)) return;
    try { await this.ad.deleteNews(n.id); await this.ad.loadNews(); void this.content.refresh(); this.say('Delete ho gayi.'); } catch (e) { this.say((e as Error).message, true); }
  }
}
