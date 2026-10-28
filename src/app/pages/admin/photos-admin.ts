import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminService, PhotoRow } from '../../chatbot/admin.service';
import { PHOTO_CATEGORIES } from '../../core/content';
import { SiteContentService } from '../../core/content.service';

@Component({
  selector: 'app-photos-admin',
  template: `
  <form class="dx-card dx-form" (submit)="$event.preventDefault(); upload()">
    <h2>Photos upload karein</h2>
    <div class="dx-two">
      <label class="dx-field">Category
        <select [value]="cat()" (change)="cat.set($any($event.target).value)">@for (c of cats; track c) { <option [value]="c" [selected]="c === cat()">{{ c }}</option> }</select></label>
      <label class="dx-field">Caption (optional, sabhi photos par lagega)
        <input type="text" maxlength="160" [value]="caption()" (input)="caption.set($any($event.target).value)"></label>
    </div>
    <label class="dx-drop" [class.on]="drag()" (dragover)="$event.preventDefault(); drag.set(true)" (dragleave)="drag.set(false)" (drop)="drop($event)">
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" (change)="pick($event)">
      <strong>{{ files().length ? files().length + ' photo chuni gayi' : 'Photos yahan kheenchein ya click karein' }}</strong>
      <span>JPG, PNG ya WEBP · ek saath kai photos chun sakte hain · badi photos apne aap chhoti ho jati hain</span>
    </label>
    @if (busy()) { <div class="bar" role="progressbar" [attr.aria-valuenow]="done()" [attr.aria-valuemax]="files().length"><i [style.width.%]="(done() / files().length) * 100"></i></div><p class="dx-hint">{{ done() }} / {{ files().length }} upload hui…</p> }
    @for (e of errs(); track $index) { <p class="dx-err">{{ e }}</p> }
    @if (msg()) { <p class="dx-ok" role="status">{{ msg() }}</p> }
    <div class="dx-acts"><button type="submit" class="dx-btn" [disabled]="busy() || !files().length">{{ busy() ? 'Upload ho raha hai…' : 'Upload karein' }}</button></div>
  </form>

  <div class="dx-bar" style="margin-top:1.5rem">
    <h2 style="margin:0">Gallery ({{ list().length }})</h2>
    <select class="flt" aria-label="Category filter" [value]="filter()" (change)="filter.set($any($event.target).value)">
      <option value="">Sabhi categories</option>@for (c of cats; track c) { <option [value]="c">{{ c }}</option> }</select>
  </div>
  @if (loadErr()) { <p class="dx-err">{{ loadErr() }}</p> }
  <div class="pg">
    @for (p of list(); track p.id) {
      <figure class="pc">
        <img [src]="ad.mediaUrl(p.mediaId)" [alt]="p.caption || p.category" loading="lazy">
        <figcaption>
          <select aria-label="Category" (change)="recat(p, $any($event.target).value)">@for (c of cats; track c) { <option [value]="c" [selected]="c === p.category">{{ c }}</option> }</select>
          <input type="text" maxlength="160" placeholder="Caption likhein" aria-label="Caption" [value]="p.caption" (change)="recap(p, $any($event.target).value)">
          <button type="button" class="dx-sm del" (click)="remove(p)">Delete</button>
        </figcaption>
      </figure>
    } @empty { <div class="dx-empty" style="grid-column:1/-1">Abhi koi photo nahi hai.</div> }
  </div>`,
  styles: [`
  .flt{min-height:42px;padding:0 .7rem;border:1px solid var(--gold);background:#fff;color:var(--brown);font:400 .95rem var(--sans)}
  .bar{height:8px;background:var(--sand);overflow:hidden}.bar i{display:block;height:100%;background:var(--gold);transition:width .3s}
  .pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
  .pc{margin:0;background:#fff;border:1px solid var(--sand)}
  .pc img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--brown)}
  .pc figcaption{display:flex;flex-direction:column;gap:.45rem;padding:.6rem}
  .pc select,.pc input{min-height:40px;padding:0 .6rem;border:1px solid var(--sand);background:#fff;color:var(--brown);font:400 .9rem var(--sans)}`],
})
export class PhotosAdminComponent implements OnInit {
  ad = inject(AdminService);
  private content = inject(SiteContentService);
  cats = PHOTO_CATEGORIES;
  cat = signal('Ashram'); caption = signal(''); files = signal<File[]>([]);
  busy = signal(false); done = signal(0); errs = signal<string[]>([]); msg = signal(''); drag = signal(false);
  filter = signal(''); loadErr = signal('');
  list = computed(() => this.ad.photos().filter((p) => !this.filter() || p.category === this.filter()));

  ngOnInit() { this.ad.loadPhotos().catch((e) => this.loadErr.set((e as Error).message)); }

  pick(e: Event) { const el = e.target as HTMLInputElement; this.files.set(Array.from(el.files ?? [])); this.msg.set(''); this.errs.set([]); }
  drop(e: DragEvent) {
    e.preventDefault(); this.drag.set(false);
    this.files.set(Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))); this.msg.set(''); this.errs.set([]);
  }

  async upload() {
    const fs = this.files(); if (!fs.length) return;
    this.busy.set(true); this.done.set(0); this.errs.set([]); this.msg.set('');
    let ok = 0;
    for (const f of fs) {
      try { const id = await this.ad.uploadImage(f); await this.ad.addPhoto(id, this.caption(), this.cat()); ok++; }
      catch (e) { this.errs.update((x) => [...x, (e as Error).message.startsWith(f.name) ? (e as Error).message : `${f.name}: ${(e as Error).message}`]); }
      this.done.update((n) => n + 1);
    }
    try { await this.ad.loadPhotos(); } catch { /* shown on next refresh */ }
    void this.content.refresh();
    this.files.set([]); this.busy.set(false);
    if (ok) this.msg.set(`✓ ${ok} photo gallery me jud gayi.`);
  }

  private async patch(p: PhotoRow, caption: string, category: string) {
    try { await this.ad.updatePhoto(p.id, caption, category); await this.ad.loadPhotos(); void this.content.refresh(); }
    catch (e) { this.errs.set([(e as Error).message]); }
  }
  recap(p: PhotoRow, v: string) { void this.patch(p, v, p.category); }
  recat(p: PhotoRow, v: string) { void this.patch(p, p.caption, v); }
  async remove(p: PhotoRow) {
    if (!confirm('Ye photo delete karein?')) return;
    try { await this.ad.deletePhoto(p.id); await this.ad.loadPhotos(); void this.content.refresh(); } catch (e) { this.errs.set([(e as Error).message]); }
  }
}
