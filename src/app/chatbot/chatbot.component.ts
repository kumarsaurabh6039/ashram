import { Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ChatbotService, Tab } from './chatbot.service';
import { LibItem, langOf } from './chatbot.logic';

/** Floating assistant in a ChatGPT-style layout. Chat is the main view; Stories / Vaniyan / Aarti open from the title menu.
 *  Full-screen on phones, docked panel on tablets/laptops. Styles live in src/styles.css (prefix .ac-). */
const readTheme = () => { try { return localStorage.getItem('ac-theme') === 'dark'; } catch { return false; } };

@Component({
  selector: 'app-chatbot',
  template: `
  @if (!open()) {
    <button type="button" class="ac-fab" (click)="toggle()" aria-haspopup="dialog" [attr.aria-label]="t().open" [attr.title]="t().open">
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M16 8V5"/><circle cx="16" cy="3.8" r="1.4" fill="currentColor" stroke="none"/>
        <path d="M9 9h14a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H15l-5 4v-4H9a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z"/>
        <circle cx="12" cy="17" r="1.8" fill="currentColor" stroke="none"/><circle cx="20" cy="17" r="1.8" fill="currentColor" stroke="none"/>
        <path d="M12.5 21c1 .8 2 1.2 3.5 1.2s2.5-.4 3.5-1.2"/>
      </svg>
    </button>
  } @else {
  <section class="ac-panel" role="dialog" [attr.aria-label]="t().title" [attr.data-theme]="dark() ? 'dark' : 'light'">
    <header class="ac-head">
      <div class="ac-menu-wrap">
        <button type="button" class="ac-title" (click)="menu.set(!menu())" [attr.aria-expanded]="menu()" aria-haspopup="menu">
          <span>{{ tab() === 'chat' ? t().title : t().tabs[tab()] }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        @if (menu()) {
          <div class="ac-menu" role="menu">
            @for (k of tabs; track k) {
              <button type="button" role="menuitemradio" [attr.aria-checked]="tab() === k" (click)="pickTab(k)">
                <span>{{ t().tabs[k] }}</span>
                @if (tab() === k) { <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg> }
              </button>
            }
            <hr>
            <button type="button" role="menuitem" (click)="toggleTheme()"><span>{{ dark() ? t().light : t().dark }}</span></button>
          </div>
        }
      </div>
      <span class="ac-grow"></span>
      <div class="ac-lang" role="group" aria-label="Language">
        <button type="button" aria-label="हिंदी" [class.on]="svc.lang() === 'hi'" (click)="svc.setLang('hi')">हिं</button>
        <button type="button" aria-label="English" [class.on]="svc.lang() === 'en'" (click)="svc.setLang('en')">EN</button>
      </div>
      <button type="button" class="ac-ib" (click)="newChat()" [attr.aria-label]="t().newChat" [attr.title]="t().newChat">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3zM14 7l3 3"/></svg>
      </button>
      <button type="button" class="ac-ib" (click)="close()" [attr.aria-label]="t().close" [attr.title]="t().close">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </header>

    @if (tab() === 'chat') {
      <div class="ac-log" #log role="log" aria-live="polite">
        @if (svc.messages().length === 0) {
          <div class="ac-empty">
            <p class="ac-hi" [attr.lang]="svc.lang()">{{ svc.lang() === 'hi' ? 'जय माँ गुरु 🙏' : 'Jai Maa Guru 🙏' }}</p>
            <h2 [attr.lang]="svc.lang()">{{ t().hello }}</h2>
            <div class="ac-sugg">@for (c of t().chips; track c.l) { <button type="button" (click)="ask(c.q)">{{ c.l }}</button> }</div>
          </div>
        }
        @for (m of svc.messages(); track $index) {
          @if (m.role === 'user') {
            <div class="ac-u"><div class="ac-ub" [attr.lang]="lang(m.text)">{{ m.text }}</div></div>
          } @else {
            <div class="ac-a">
              <div class="ac-at" [class.typing]="m.typing" [attr.lang]="lang(m.text)">{{ m.text }}</div>
              @if (!m.typing) {
                <div class="ac-tools2">
                  <button type="button" class="ac-ic" (click)="svc.copy(m.text); flash('c' + $index)" [attr.aria-label]="t().copy" [attr.title]="t().copy">
                    @if (copied() === 'c' + $index) { <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg> }
                    @else { <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg> }
                  </button>
                  <button type="button" class="ac-ic" (click)="svc.toggleSpeak('m' + $index, m.text)" [attr.aria-label]="svc.playing() === 'm' + $index ? t().stop : t().listen" [attr.title]="svc.playing() === 'm' + $index ? t().stop : t().listen">
                    @if (svc.playing() === 'm' + $index) { <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg> }
                    @else { <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4zM16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/></svg> }
                  </button>
                </div>
              }
            </div>
          }
        }
        @if (svc.busy()) { <div class="ac-a"><span class="ac-think" role="status" aria-label="…"></span></div> }
        @if (svc.waking()) { <p class="ac-wake" role="status">{{ t().waking }}</p> }
        @if (svc.note()) { <p class="ac-err">{{ svc.note() }}</p> }
      </div>
      <form class="ac-compose" (submit)="$event.preventDefault(); send()">
        @if (svc.listening()) { <p class="ac-listen" role="status"><i></i>{{ t().listening }}</p> }
        <div class="ac-box">
          <textarea #inp rows="1" maxlength="500" enterkeyhint="send" autocomplete="off" [placeholder]="t().ph" [attr.aria-label]="t().ph" [value]="draft()" (input)="onInput(inp)" (keydown)="onKey($event)"></textarea>
          @if (svc.voiceOk) {
            <button type="button" class="ac-mic" [class.on]="svc.listening()" (click)="mic()" [attr.aria-label]="svc.listening() ? t().micStop : t().mic" [attr.title]="svc.listening() ? t().micStop : t().mic" [attr.aria-pressed]="svc.listening()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
            </button>
          }
          <button type="submit" class="ac-go" [disabled]="svc.busy() || !draft().trim()" [attr.aria-label]="t().send" [attr.title]="t().send">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
        </div>
        <p class="ac-foot">{{ t().warn }}</p>
      </form>
    } @else {
      <div class="ac-lib">
        @if (tab() === 'vani') {
          <div class="ac-tools">
            <input type="search" [placeholder]="t().search" [attr.aria-label]="t().search" [value]="q()" (input)="onSearch($event)">
            <button type="button" class="ac-act" (click)="randomVani()">{{ t().random }}</button>
            @if (pinned()) { <button type="button" class="ac-act" (click)="pinned.set(null)">{{ t().all }}</button> }
          </div>
        }
        @if (svc.libError()) { <p class="ac-err">{{ t().liberr }}</p> }
        @if (svc.note()) { <p class="ac-err">{{ svc.note() }}</p> }
        @for (i of items(); track i.id) {
          <article class="ac-card">
            @if (tab() === 'story') {
              <button type="button" class="ac-h" (click)="toggleOpen(i.id)" [attr.aria-expanded]="isOpen(i)"><span>{{ svc.lang() === 'hi' ? i.title : i.titleEn }}</span><span aria-hidden="true">{{ isOpen(i) ? '−' : '+' }}</span></button>
            } @else if (tab() === 'vani') {
              <h3 class="ac-h2" [attr.lang]="svc.lang()">{{ i.id.slice(1) }}. {{ svc.lang() === 'hi' ? i.group : i.groupEn }}</h3>
            } @else {
              <h3 class="ac-h2" [attr.lang]="svc.lang()">{{ svc.lang() === 'hi' ? i.title : i.titleEn }}</h3>
            }
            @if (isOpen(i)) {
              <p class="ac-t" [attr.lang]="lang(svc.shown(i))">{{ svc.shown(i) }}</p>
              <div class="ac-acts">
                <button type="button" class="ac-act" (click)="svc.toggleSpeak(i.id, svc.shown(i))">{{ svc.playing() === i.id ? t().stop : t().listen }}</button>
                <button type="button" class="ac-act" (click)="svc.toggleTranslate(i)">{{ svc.showTr()[i.id] ? t().orig : t().tr }}</button>
                <button type="button" class="ac-act" (click)="copy(i)">{{ copied() === i.id ? t().copied : t().copy }}</button>
              </div>
            } @else if (svc.lang() === 'en' && i.summaryEn) { <p class="ac-s">{{ i.summaryEn }}</p> }
          </article>
        }
      </div>
    }
  </section>
  }`,
})
export class ChatbotComponent {
  svc = inject(ChatbotService);
  menu = signal(false);
  dark = signal(readTheme());
  t = this.svc.t;
  tabs: Tab[] = ['chat', 'story', 'vani', 'aarti'];
  open = signal(false);
  tab = signal<Tab>('chat');
  draft = signal('');
  q = signal('');
  pinned = signal<string | null>(null);
  openId = signal<string | null>(null);
  copied = signal<string | null>(null);
  log = viewChild<ElementRef<HTMLElement>>('log');
  inp = viewChild<ElementRef<HTMLTextAreaElement>>('inp');
  lang = langOf;

  items = computed<LibItem[]>(() => {
    const kind = this.tab(); const q = this.q().trim(); const pin = this.pinned();
    return this.svc.library().filter((i) => i.kind === kind && (!pin || i.id === pin) && (!q || i.text.includes(q) || (i.group ?? '').includes(q)));
  });

  constructor() {
    effect(() => {                       // keep the newest message in view
      this.svc.messages(); this.svc.busy(); this.open(); this.tab();
      setTimeout(() => { const el = this.log()?.nativeElement; if (el) el.scrollTop = el.scrollHeight; });
    });
  }

  toggle() {
    const v = !this.open(); this.open.set(v);
    document.body.classList.toggle('ac-lock', v);
    if (v) { void this.svc.loadLibrary(); void this.svc.wake(); setTimeout(() => { if (matchMedia('(pointer:fine)').matches) this.inp()?.nativeElement.focus(); }); }
    else { this.svc.stop(); this.svc.stopVoice(); this.menu.set(false); }
  }
  close() { if (this.open()) this.toggle(); }
  @HostListener('document:keydown.escape') esc() { this.close(); }

  setTab(k: Tab) { this.svc.stop(); this.svc.note.set(''); this.tab.set(k); this.pinned.set(null); this.q.set(''); }
  send() { const v = this.draft(); this.draft.set(''); this.resize(); void this.svc.send(v); }
  onInput(el: HTMLTextAreaElement) { this.draft.set(el.value); this.resize(); }
  onKey(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && matchMedia('(pointer:fine)').matches) { e.preventDefault(); if (this.draft().trim() && !this.svc.busy()) this.send(); } }
  private resize() { setTimeout(() => { const el = this.inp()?.nativeElement; if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; } }); }
  mic() { this.svc.toggleVoice((v) => { this.draft.set(v); this.resize(); }); }
  flash(k: string) { this.copied.set(k); setTimeout(() => this.copied.set(null), 1500); }
  newChat() { this.menu.set(false); this.tab.set('chat'); this.svc.newChat(); }
  pickTab(k: Tab) { this.menu.set(false); this.setTab(k); }
  toggleTheme() { const v = !this.dark(); this.dark.set(v); this.menu.set(false); try { localStorage.setItem('ac-theme', v ? 'dark' : 'light'); } catch { /* private mode */ } }
  @HostListener('document:click', ['$event']) outside(e: Event) { if (this.menu() && !(e.target as HTMLElement).closest('.ac-menu-wrap')) this.menu.set(false); }
  ask(q: string) { void this.svc.send(q); }
  onSearch(e: Event) { this.pinned.set(null); this.q.set((e.target as HTMLInputElement).value); }
  randomVani() { const v = this.svc.library().filter((i) => i.kind === 'vani'); if (v.length) { this.q.set(''); this.pinned.set(v[Math.floor(Math.random() * v.length)].id); } }
  toggleOpen(id: string) { this.openId.set(this.openId() === id ? null : id); }
  isOpen(i: LibItem) { return this.tab() !== 'story' || this.openId() === i.id; }
  copy(i: LibItem) { this.svc.copy(this.svc.shown(i)); this.copied.set(i.id); setTimeout(() => this.copied.set(null), 1500); }
}