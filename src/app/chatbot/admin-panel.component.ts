import { Component, OnDestroy, OnInit, computed, inject, output, signal } from '@angular/core';
import { AdminService, DocMeta, MAX_MB, SearchHit } from './admin.service';

type AdminTab = 'upload' | 'docs' | 'test';

/** Login form + admin tools (upload PDF / images / text, manage documents, test search). Rendered inside the chatbot panel. */
@Component({
  selector: 'app-ac-admin',
  template: `
  @if (!ad.loggedIn()) {
    <form class="ad-login" (submit)="$event.preventDefault(); login()">
      <h3>Admin Login</h3>
      <p class="ad-hint">Sirf Trust ke admin ke liye. / For Trust admins only.</p>
      <label>Email<input type="email" autocomplete="username" [value]="email()" (input)="email.set($any($event.target).value)" required></label>
      <label>Password<input type="password" autocomplete="current-password" [value]="pass()" (input)="pass.set($any($event.target).value)" required></label>
      @if (err()) { <p class="ac-err" role="alert">{{ err() }}</p> }
      <button type="submit" class="ad-btn" [disabled]="busy() || !email() || !pass()">{{ busy() ? 'Login ho raha hai…' : 'Login' }}</button>
      <button type="button" class="ad-link" (click)="back.emit()">← Chat par wapas</button>
    </form>
  } @else {
    <div class="ad-wrap">
      <div class="ad-top"><span class="ad-who">{{ ad.email() }}</span><button type="button" class="ad-link" (click)="logout()">Logout</button></div>
      <nav class="ad-tabs" role="tablist">
        <button type="button" role="tab" [class.on]="tab() === 'upload'" (click)="tab.set('upload')">Upload</button>
        <button type="button" role="tab" [class.on]="tab() === 'docs'" (click)="tab.set('docs')">Documents ({{ ad.docs().length }})</button>
        <button type="button" role="tab" [class.on]="tab() === 'test'" (click)="tab.set('test')">Test</button>
      </nav>

      <div class="ad-body">
      @if (tab() === 'upload') {
        <form class="ad-form" (submit)="$event.preventDefault(); upload()">
          <label>Category / श्रेणी
            <select [value]="cat()" (change)="cat.set($any($event.target).value)">
              <option value="">— चुनिए —</option>
              @for (c of ad.cats(); track c.id) { <option [value]="c.id">{{ c.hi }}</option> }
            </select></label>
          <div class="ad-mode" role="group">
            <button type="button" [class.on]="mode() === 'file'" (click)="mode.set('file')">PDF / Image</button>
            <button type="button" [class.on]="mode() === 'text'" (click)="mode.set('text')">Text likhein</button>
          </div>
          <label>Title / शीर्षक
            <input type="text" maxlength="120" placeholder="जैसे: आश्रम की जानकारी, Donation details" [value]="title()" (input)="title.set($any($event.target).value)">
          </label>
          @if (mode() === 'file') {
            <label>File (PDF, JPG, PNG, WEBP — max {{ maxMb }} MB)
              <input type="file" multiple accept="application/pdf,image/png,image/jpeg,image/webp" (change)="onFiles($event)">
            </label>
            @if (files().length > 1) { <p class="ad-hint">{{ files().length }} files: har file ka title uska naam hoga.</p> }
          } @else {
            <label>Text
              <textarea rows="7" placeholder="Yahan seedha jaankari likhein (jaise donation kaise karein, bank/UPI, aashram me kitne bachche…)" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
            </label>
          }
          <label>Extra note (optional)
            <textarea rows="3" placeholder="Image/PDF ke baare me pakki jaankari. Ye bhi chatbot ko milegi." [value]="note()" (input)="note.set($any($event.target).value)"></textarea>
          </label>
          @if (msg()) { <p [class]="msgBad() ? 'ac-err' : 'ad-ok'" role="status">{{ msg() }}</p> }
          <button type="submit" class="ad-btn" [disabled]="busy()">{{ busy() ? 'Upload ho raha hai…' : 'Upload karein' }}</button>
          <p class="ad-hint">Upload ke baad file ka text padha jaata hai (kuch minute lag sakte hain). “Documents” me status dekhein, aur “View text” se jaanch lein ki sab sahi padha gaya.</p>
        </form>
      }

      @if (tab() === 'docs') {
        @if (!ad.docs().length) { <p class="ad-hint">Abhi koi document nahi hai.</p> }
        @for (d of ad.docs(); track d.id) {
          <article class="ad-doc">
            <div class="ad-doc-h"><strong>{{ d.title }}</strong><span class="ad-badge" [attr.data-s]="d.status">{{ label(d) }}</span></div>
            <p class="ad-meta">{{ catName(d.category) }} · {{ d.kind.toUpperCase() }} · {{ d.chunkCount }} parts · {{ date(d.createdAt) }}</p>
            @if (d.status === 'processing' && d.progress) { <div class="ad-bar"><i [style.width.%]="pct(d)"></i></div> }
            @if (d.error) { <p [class]="d.status === 'failed' ? 'ac-err' : 'ad-hint'">{{ d.error }}</p> }
            <div class="ac-acts">
              @if (d.status === 'ready') { <button type="button" class="ac-act" (click)="togglePreview(d)">{{ preview()[d.id] ? 'Hide' : 'View text' }}</button> }
              <button type="button" class="ac-act ad-del" (click)="remove(d)">Delete</button>
            </div>
            @if (preview()[d.id]; as pv) { @for (c of pv; track $index) { <pre class="ad-pre">{{ c }}</pre> } }
          </article>
        }
      }

      @if (tab() === 'test') {
        <form class="ad-form" (submit)="$event.preventDefault(); runTest()">
          <label>Koi sawal likhein (jaise chatbot ko puchhte)
            <input type="text" [value]="q()" (input)="q.set($any($event.target).value)" placeholder="आश्रम में दान कैसे करें?"></label>
          <button type="submit" class="ad-btn" [disabled]="busy() || !q().trim()">Search</button>
        </form>
        @if (tested()) {
          <p class="ad-hint">Chatbot sirf “USED” wale parts se jawab dega (score ≥ {{ threshold() }}). Kuch “USED” nahi → chatbot “jaankari nahi hai” bolega.</p>
          @for (h of hits(); track $index) {
            <article class="ad-doc"><div class="ad-doc-h"><strong>{{ h.title }}</strong><span class="ad-badge" [attr.data-s]="h.used ? 'ready' : 'failed'">{{ h.score }} {{ h.used ? 'USED' : 'low' }}</span></div>
              <p class="ad-meta">{{ catName(h.category) }}</p><pre class="ad-pre">{{ h.text }}</pre></article>
          } @empty { <p class="ad-hint">Kuch nahi mila.</p> }
        }
      }
      </div>
    </div>
  }`,
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  ad = inject(AdminService);
  back = output<void>();
  maxMb = MAX_MB;
  email = signal(''); pass = signal(''); err = signal(''); busy = signal(false);
  tab = signal<AdminTab>('upload');
  cat = signal(''); title = signal(''); mode = signal<'file' | 'text'>('file'); text = signal(''); note = signal('');
  files = signal<File[]>([]); msg = signal(''); msgBad = signal(false);
  preview = signal<Record<string, string[] | undefined>>({});
  q = signal(''); hits = signal<SearchHit[]>([]); threshold = signal(0); tested = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;
  private cats = computed(() => new Map(this.ad.cats().map((c) => [c.id, c.hi])));

  ngOnInit() { if (this.ad.loggedIn()) void this.start(); }
  ngOnDestroy() { this.stopPoll(); }

  private async start() {
    try { await Promise.all([this.ad.loadCats(), this.ad.loadDocs()]); } catch (e) { this.msg.set((e as Error).message); this.msgBad.set(true); }
    this.poll();
  }
  /** While any document is being processed, refresh the list every 4 seconds. */
  private poll() {
    this.stopPoll();
    this.timer = setInterval(async () => {
      if (!this.ad.loggedIn()) return this.stopPoll();
      if (this.ad.docs().some((d) => d.status === 'processing')) { try { await this.ad.loadDocs(); } catch { /* next tick */ } }
    }, 4000);
  }
  private stopPoll() { if (this.timer) clearInterval(this.timer); this.timer = null; }

  async login() {
    this.busy.set(true); this.err.set('');
    const e = await this.ad.login(this.email().trim(), this.pass());
    this.busy.set(false);
    if (e) return this.err.set(e);
    this.pass.set(''); await this.start();
  }
  logout() { this.stopPoll(); this.ad.logout(); this.back.emit(); }

  onFiles(e: Event) { this.files.set(Array.from((e.target as HTMLInputElement).files ?? [])); }

  async upload() {
    this.msg.set(''); this.msgBad.set(true);
    if (!this.cat()) return this.msg.set('Category chuniye.');
    const isFile = this.mode() === 'file', fs = this.files();
    if (isFile && !fs.length) return this.msg.set('File chuniye.');
    if (isFile && fs.some((f) => f.size > this.maxMb * 1024 * 1024)) return this.msg.set(`Har file ${this.maxMb} MB se chhoti honi chahiye.`);
    if (!isFile && this.text().trim().length < 20) return this.msg.set('Text likhiye (kam se kam 20 akshar).');
    if (!isFile && !this.title().trim()) return this.msg.set('Title likhiye.');
    this.busy.set(true);
    try {
      if (isFile) for (const f of fs) await this.ad.addFile(f, fs.length === 1 && this.title().trim() ? this.title().trim() : f.name.replace(/\.[^.]+$/, ''), this.cat(), this.note());
      else await this.ad.addText(this.title().trim(), this.cat(), this.text(), this.note());
      this.msgBad.set(false); this.msg.set('✓ Upload ho gaya. Ab padhna shuru hai — “Documents” me dekhein.');
      this.title.set(''); this.text.set(''); this.note.set(''); this.files.set([]);
      await this.ad.loadDocs(); this.tab.set('docs');
    } catch (e) { this.msgBad.set(true); this.msg.set((e as Error).message); }
    this.busy.set(false);
  }

  async remove(d: DocMeta) {
    if (!confirm(`"${d.title}" delete karein? Chatbot ise bhool jayega.`)) return;
    try { await this.ad.remove(d.id); await this.ad.loadDocs(); } catch (e) { alert((e as Error).message); }
  }
  async togglePreview(d: DocMeta) {
    if (this.preview()[d.id]) return this.preview.update((p) => ({ ...p, [d.id]: undefined }));
    try { const r = await this.ad.preview(d.id); this.preview.update((p) => ({ ...p, [d.id]: r.chunks.length ? r.chunks : ['(Text abhi load nahi hua. Thodi der baad dobara dekhein.)'] })); }
    catch (e) { alert((e as Error).message); }
  }
  async runTest() {
    this.busy.set(true);
    try { const r = await this.ad.search(this.q()); this.hits.set(r.hits); this.threshold.set(r.threshold); this.tested.set(true); } catch (e) { alert((e as Error).message); }
    this.busy.set(false);
  }

  catName = (id: string) => this.cats().get(id) ?? id;
  date = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  pct = (d: DocMeta) => (d.progress && d.progress.total ? Math.min(100, Math.round((d.progress.done / d.progress.total) * 100)) : 5);
  label(d: DocMeta) {
    if (d.status === 'ready') return 'Ready ✓';
    if (d.status === 'failed') return 'Failed';
    return ({ queued: 'Line me', reading: 'Padh raha hai', embedding: 'Seekh raha hai', saving: 'Save ho raha hai' } as Record<string, string>)[d.stage ?? ''] ?? 'Processing';
  }
}
