import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AdminPanelComponent } from '../../chatbot/admin-panel.component';
import { AdminService } from '../../chatbot/admin.service';
import { SITE } from '../../core/site.config';
import { NewsAdminComponent } from './news-admin';
import { PhotosAdminComponent } from './photos-admin';

type Tab = 'home' | 'news' | 'photos' | 'chatbot';
const TABS: { id: Tab; en: string; hi: string; icon: string }[] = [
  { id: 'home', en: 'Overview', hi: 'सारांश', icon: 'M3 11l9-8 9 8M5 10v10h14V10' },
  { id: 'news', en: 'News', hi: 'समाचार', icon: 'M4 5h13v14H6a2 2 0 0 1-2-2V5zM17 8h3v9a2 2 0 0 1-2 2M8 9h5M8 13h5' },
  { id: 'photos', en: 'Photos', hi: 'फ़ोटो गैलरी', icon: 'M3 6h18v13H3zM3 15l5-4 4 3 3-2 6 5M16 10a1 1 0 1 0 0-.01' },
  { id: 'chatbot', en: 'Chatbot Training', hi: 'चैटबॉट ट्रेनिंग', icon: 'M5 6h14v9H10l-4 3v-3H5zM9 10h.01M15 10h.01' },
];

/** /admin: login screen, or the dashboard once signed in. All data changes go through the server (Firebase login is checked there). */
@Component({
  selector: 'app-admin-page',
  imports: [RouterLink, NewsAdminComponent, PhotosAdminComponent, AdminPanelComponent],
  template: `
  @if (!ad.loggedIn()) {
    <section class="lg">
      <div class="lg-card">
        <img src="assets/logo.png" alt="" width="72" height="72">
        <h1>Admin Login</h1>
        <p class="lg-sub">Sirf Trust ke admin ke liye · <span lang="hi">केवल ट्रस्ट के एडमिन के लिए</span></p>
        <form (submit)="$event.preventDefault(); login()">
          <label class="dx-field">Email
            <input type="email" autocomplete="username" required [value]="email()" (input)="email.set($any($event.target).value)"></label>
          <label class="dx-field">Password
            <span class="pw"><input [type]="show() ? 'text' : 'password'" autocomplete="current-password" required [value]="pass()" (input)="pass.set($any($event.target).value)">
              <button type="button" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'">{{ show() ? 'Hide' : 'Show' }}</button></span></label>
          @if (err()) { <p class="dx-err" role="alert">{{ err() }}</p> }
          <button type="submit" class="dx-btn" [disabled]="busy() || !email() || !pass()">{{ busy() ? 'Login ho raha hai…' : 'Login' }}</button>
        </form>
        <a routerLink="/" class="lg-back">← Website par wapas</a>
      </div>
    </section>
  } @else {
    <div class="dash">
      <aside class="dnav" aria-label="Dashboard menu">
        <p class="dnav-t">Admin Dashboard</p>
        <nav>
          @for (t of tabs; track t.id) {
            <button type="button" [class.on]="tab() === t.id" [attr.aria-current]="tab() === t.id ? 'page' : null" (click)="go(t.id)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="t.icon"/></svg>
              <span>{{ t.en }}<small lang="hi">{{ t.hi }}</small></span>
            </button>
          }
        </nav>
        <div class="dnav-f">
          <span class="who">{{ ad.email() }}</span>
          <a routerLink="/" target="_blank" rel="noopener">Website dekhein ↗</a>
          <button type="button" (click)="logout()">Logout</button>
        </div>
      </aside>

      <main class="dmain">
        <h1>{{ current().en }} <small lang="hi">{{ current().hi }}</small></h1>

        @switch (tab()) {
          @case ('home') {
            <p class="dx-lead">जय माँ गुरु 🙏 &nbsp;Yahan se website ki news, photographs aur chatbot ki training sambhaaliye.</p>
            @if (statsErr()) { <p class="dx-err" role="alert">{{ statsErr() }}</p> }
            <div class="stats">
              <button type="button" class="stat" (click)="go('news')"><b>{{ published() }}</b><span>News live</span><small>{{ ad.news().length }} total</small></button>
              <button type="button" class="stat" (click)="go('photos')"><b>{{ ad.photos().length }}</b><span>Photographs</span><small>gallery me</small></button>
              <button type="button" class="stat" (click)="go('chatbot')"><b>{{ ready() }}</b><span>Chatbot documents</span><small>{{ busyDocs() ? busyDocs() + ' process ho rahe' : 'ready' }}</small></button>
              <button type="button" class="stat" [class.warn]="failed()" (click)="go('chatbot')"><b>{{ failed() }}</b><span>Failed uploads</span><small>{{ failed() ? 'dekhne zaruri' : 'sab theek' }}</small></button>
            </div>
            <div class="dx-card">
              <h2>Jaldi karein</h2>
              <div class="quick">
                <button type="button" class="dx-btn" (click)="go('news')">＋ News likhein</button>
                <button type="button" class="dx-btn" (click)="go('photos')">＋ Photos upload karein</button>
                <button type="button" class="dx-btn" (click)="go('chatbot')">＋ Chatbot ko train karein</button>
              </div>
            </div>
            <div class="dx-card">
              <h2>Kaise kaam karta hai</h2>
              <ul class="how">
                <li><b>News / Photos:</b> save karte hi website par dikhne lagte hain. Draft rakhna ho to "Published" ka tick hata dein.</li>
                <li><b>Chatbot Training:</b> PDF, image ya text upload karein. Chatbot sirf wahi jaankari batata hai jo yahan upload hui hai.</li>
                <li><b>Donation / ashram ki jaankari:</b> "Chatbot Training" me category chunkar seedha text likh dein, taaki chatbot sahi jawab de.</li>
              </ul>
            </div>
          }
          @case ('news') { <app-news-admin/> }
          @case ('photos') { <app-photos-admin/> }
          @case ('chatbot') { <div class="dx-card dx-narrow"><app-ac-admin (back)="tab.set('home')"/></div> }
        }
      </main>
    </div>
  }`,
  styles: [`
  :host{display:block}
  .lg{min-height:calc(100vh - var(--header-h) - 40px);display:grid;place-items:center;padding:2rem 1rem;background:radial-gradient(circle at 50% 0,#fff,var(--sand))}
  .lg-card{width:min(100%,420px);padding:2rem 1.75rem;background:#fff;border:1px solid var(--sand);border-top:4px solid var(--gold);box-shadow:0 18px 50px rgba(53,36,31,.15);text-align:center}
  .lg-card img{border-radius:50%}.lg-card h1{margin:.6rem 0 .1rem;font-size:2rem}
  .lg-sub{margin:0 0 1.25rem;font-size:.9rem;color:#6b6058}
  .lg-card form{display:flex;flex-direction:column;gap:.9rem;text-align:left}
  .pw{display:flex}.pw input{flex:1;min-width:0;border-right:0}
  .pw button{padding:0 .9rem;border:1px solid var(--gold);background:var(--sand);color:var(--maroon);font:500 .85rem var(--sans);cursor:pointer}
  .lg-back{display:inline-block;margin-top:1.25rem;font-size:.9rem}
  .dash{display:grid;grid-template-columns:264px minmax(0,1fr);min-height:calc(100vh - var(--header-h));background:#f6f1e8}
  .dnav{position:sticky;top:var(--header-h);align-self:start;height:calc(100vh - var(--header-h));display:flex;flex-direction:column;gap:.4rem;padding:1.25rem .9rem;background:linear-gradient(170deg,var(--maroon),var(--brown));color:var(--ivory);overflow-y:auto}
  .dnav-t{margin:0 .4rem .8rem;font:600 1.35rem var(--serif);color:var(--gold)}
  .dnav nav{display:flex;flex-direction:column;gap:.25rem}
  .dnav nav button{display:flex;align-items:center;gap:.75rem;min-height:52px;padding:.4rem .8rem;border:0;border-radius:8px;background:transparent;color:var(--sand);font:500 .98rem var(--sans);text-align:left;cursor:pointer;transition:background .15s}
  .dnav nav button span{display:flex;flex-direction:column;line-height:1.25}.dnav nav small{font-size:.72rem;opacity:.75}
  .dnav nav button:hover{background:rgba(255,255,255,.08)}
  .dnav nav button.on{background:var(--gold);color:var(--brown);font-weight:600}
  .dnav-f{margin-top:auto;display:flex;flex-direction:column;gap:.5rem;padding:.9rem .4rem 0;border-top:1px solid rgba(255,255,255,.18);font-size:.85rem}
  .who{overflow:hidden;text-overflow:ellipsis;color:var(--sand)}.dnav-f a{color:var(--gold)}
  .dnav-f button{min-height:42px;border:1px solid var(--gold);border-radius:6px;background:transparent;color:var(--ivory);font:500 .9rem var(--sans);cursor:pointer}
  .dnav-f button:hover{background:var(--gold);color:var(--brown)}
  .dmain{padding:clamp(1rem,3vw,2.25rem);min-width:0}
  .dmain h1{font-size:clamp(1.7rem,3vw,2.3rem);margin-bottom:.9rem}.dmain h1 small{font:500 1rem var(--serif-hi);color:#8a6a3c;margin-left:.4rem}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem;margin-bottom:1.25rem}
  .stat{display:flex;flex-direction:column;padding:1.1rem 1.2rem;border:1px solid var(--sand);border-left:4px solid var(--gold);background:#fff;text-align:left;cursor:pointer;transition:box-shadow .15s,transform .15s}
  .stat:hover{box-shadow:0 8px 22px rgba(53,36,31,.12);transform:translateY(-2px)}
  .stat b{font:600 2.4rem/1.1 var(--serif);color:var(--maroon)}.stat span{font-weight:600;color:var(--brown)}.stat small{color:#7a6d63}
  .stat.warn{border-left-color:#c00000}.stat.warn b{color:#c00000}
  .quick{display:flex;flex-wrap:wrap;gap:.7rem}
  .how{margin:0;padding-left:1.2rem;display:grid;gap:.5rem}
  @media(max-width:860px){
    .dash{grid-template-columns:1fr}
    .dnav{position:static;height:auto;padding:.6rem}
    .dnav-t{display:none}
    .dnav nav{flex-direction:row;overflow-x:auto;gap:.3rem;padding-bottom:.2rem}
    .dnav nav button{flex:none;min-height:46px;padding:.3rem .8rem}.dnav nav small{display:none}
    .dnav-f{flex-direction:row;flex-wrap:wrap;align-items:center;margin-top:.4rem;padding:.6rem .3rem 0}.dnav-f button{padding:0 1rem}.who{flex:1 1 100%}
  }`],
})
export class AdminPageComponent implements OnDestroy {
  ad = inject(AdminService);
  private meta = inject(Meta);
  tabs = TABS;
  tab = signal<Tab>('home');
  current = computed(() => TABS.find((t) => t.id === this.tab())!);
  email = signal(''); pass = signal(''); show = signal(false); err = signal(''); busy = signal(false); statsErr = signal('');

  published = computed(() => this.ad.news().filter((n) => n.published).length);
  ready = computed(() => this.ad.docs().filter((d) => d.status === 'ready').length);
  failed = computed(() => this.ad.docs().filter((d) => d.status === 'failed').length);
  busyDocs = computed(() => this.ad.docs().filter((d) => d.status === 'processing').length);

  constructor(t: Title) {
    t.setTitle(`Admin Dashboard | ${SITE.short}`);
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (this.ad.loggedIn()) void this.stats();
  }
  ngOnDestroy() { this.meta.removeTag("name='robots'"); }

  async stats() {
    this.statsErr.set('');
    try { await Promise.all([this.ad.loadNews(), this.ad.loadPhotos(), this.ad.loadDocs()]); }
    catch (e) { this.statsErr.set((e as Error).message); }
  }
  async login() {
    this.busy.set(true); this.err.set('');
    const e = await this.ad.login(this.email().trim(), this.pass());
    this.busy.set(false);
    if (e) return this.err.set(e);
    this.pass.set(''); void this.stats();
  }
  go(t: Tab) { this.tab.set(t); if (t === 'home') void this.stats(); window.scrollTo({ top: 0 }); }
  logout() { this.ad.logout(); this.tab.set('home'); }
}
