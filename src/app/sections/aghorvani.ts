import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QUOTES, QUOTES_NOTE, VANI_BY } from '../core/content';
import { Quote } from '../core/models';

const DEVA = '०१२३४५६७८९';
const deva = (n: number) => String(n).replace(/\d/g, d => DEVA[+d]);

/* ───────────────────────── One compact card: ॐ glows behind the text ───────────────────────── */
@Component({
  selector: 'app-vani-card',
  imports: [RouterLink],
  template: `
  <article class="vani" [attr.id]="full() ? 'vani-' + (n() + 1) : null">
    <svg class="rings" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="100" cy="100" r="96" stroke-width=".6" stroke-dasharray="2 5"/>
      <circle cx="100" cy="100" r="76" stroke-width=".8"/>
      <circle cx="100" cy="100" r="58" stroke-width=".6" stroke-dasharray="1 4"/>
      <path stroke-width=".5" d="M100 4v192M4 100h192M32 32l136 136M168 32L32 168"/>
    </svg>
    <span class="om" lang="hi" aria-hidden="true">ॐ</span>
    <span class="num" aria-hidden="true">{{ num() }}</span>
    <div class="content">
      <h3 lang="hi">{{ q().title }}</h3>
      <span class="line" aria-hidden="true"></span>
      <blockquote lang="hi"><p>{{ q().text }}</p></blockquote>
      <span class="by" lang="hi">— {{ by }}</span>
      @if (full()) {
        <button type="button" class="act" (click)="share()" [attr.aria-label]="'Share teaching ' + (n() + 1)">{{ done() ? '✓ Copied' : 'Share' }}</button>
      } @else {
        <a class="act" routerLink="/aghorvani" [fragment]="'vani-' + (n() + 1)" [attr.tabindex]="dup() ? -1 : null">Read More →</a>
      }
    </div>
  </article>`,
  styles: [`
  :host{display:block;height:100%}
  .vani{position:relative;overflow:hidden;height:100%;min-height:330px;display:flex;flex-direction:column;align-items:center;text-align:center;color:var(--ivory);
    border:1px solid var(--gold);border-radius:125px 125px 10px 10px;padding:2.8rem 1rem 1rem;
    background:radial-gradient(circle at 50% 50%,rgba(178,138,75,.26),transparent 62%),linear-gradient(165deg,#74402f,var(--maroon) 55%,#2c1a15);
    box-shadow:0 10px 26px rgba(0,0,0,.3);transition:transform .35s,box-shadow .35s;scroll-margin-top:calc(var(--header-h) + 16px)}
  .vani::after{content:"";position:absolute;inset:6px;border:1px solid rgba(178,138,75,.45);border-radius:119px 119px 6px 6px;pointer-events:none}
  .vani:hover,.vani:focus-within{transform:translateY(-5px);box-shadow:0 18px 38px rgba(0,0,0,.45)}
  .rings{position:absolute;left:50%;top:54%;width:112%;aspect-ratio:1;transform:translate(-50%,-50%);color:var(--gold);opacity:.28;animation:spin 70s linear infinite}
  .om{position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);font:600 8.5rem/1 var(--serif-hi);color:var(--gold);opacity:.2;pointer-events:none;user-select:none;animation:glow 5s ease-in-out infinite}
  .num{position:absolute;top:1.15rem;left:50%;transform:translateX(-50%);font:600 .8rem var(--serif-hi);letter-spacing:.08em;color:var(--sand);
    border:1px solid var(--gold);border-radius:999px;padding:0 .75rem;background:rgba(0,0,0,.28);line-height:1.6}
  @keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
  @keyframes glow{0%,100%{opacity:.14;text-shadow:0 0 18px rgba(232,196,130,.3)}50%{opacity:.26;text-shadow:0 0 38px rgba(240,210,150,.8)}}
  .content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;flex:1;width:100%;text-shadow:0 1px 8px rgba(0,0,0,.7)}
  h3{color:var(--gold);font-size:1.02rem;margin:0;letter-spacing:.02em}
  .line{display:block;width:54px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:.5rem 0 .7rem}
  blockquote{margin:0 0 .8rem}
  blockquote p{margin:0;font:500 .95rem/1.7 var(--serif-hi);color:var(--ivory)}
  .by{margin-top:auto;margin-bottom:.7rem;font-size:.74rem;color:var(--gold);letter-spacing:.03em}
  .act{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:.2rem 1rem;border:1px solid var(--gold);background:rgba(0,0,0,.2);
    color:var(--ivory);font:500 .8rem var(--sans);text-decoration:none;cursor:pointer;text-shadow:none;transition:background .2s,color .2s}
  .act:hover{background:var(--gold);color:var(--brown)}`],
})
export class VaniCardComponent {
  n = input.required<number>();
  q = input.required<Quote>();
  full = input(false);
  dup = input(false);          // repeated copy used only for the endless loop
  by = VANI_BY;
  done = signal(false);
  num() { return deva(this.n() + 1); }

  async share() {
    const text = `“${this.q().text}”\n— ${VANI_BY}`;
    try {
      if (navigator.share) { await navigator.share({ text, url: location.origin + '/aghorvani#vani-' + (this.n() + 1) }); return; }
      await navigator.clipboard.writeText(text);
      this.done.set(true); setTimeout(() => this.done.set(false), 2000);
    } catch { /* cancelled or clipboard blocked */ }
  }
}

/* ───────────────────────── Home: endless slow slide, right → left ───────────────────────── */
const COPIES = 3;                  // [A][B][C] identical sets; we live in B and jump by one set width, which is invisible
const SPEED = 0.05;                // px per ms (≈ 50px/s)
const HOLD_MS = 3500;              // resume this long after the visitor touches / drags / clicks an arrow

@Component({
  selector: 'app-aghorvani',
  imports: [RouterLink, VaniCardComponent],
  template: `
  <section id="aghorvani" class="av" aria-labelledby="av-h">
    <span class="mark" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container head">
      <p class="eyebrow">AGHORVANI</p>
      <h2 id="av-h">Aghorvani</h2>
      <div class="orn" aria-hidden="true"><i></i></div>
      <p class="sub" lang="hi">अघोरेश्वर वाणी</p>
    </div>

    <div #track class="track" tabindex="0" role="region" aria-label="Teachings of Aghoreshwar Bhagwan Ram Ji"
         (touchstart)="hold()" (pointerdown)="hold()" (touchend)="release()" (pointerup)="release()" (touchcancel)="release()" (wheel)="hold(); release()">
      @for (c of loop; track $index) {
        <div class="slot" [attr.aria-hidden]="c.dup ? 'true' : null"><app-vani-card [n]="c.n" [q]="c.q" [dup]="c.dup"/></div>
      }
    </div>

    <div class="container foot">
      <div class="ctl">
        <button type="button" class="nav" (click)="go(-1)" aria-label="Previous teaching">‹</button>
        <div class="dots">
          @for (q of quotes; track $index) {
            <button type="button" class="dot" [class.on]="$index === active()" (click)="toIndex($index)"
                    [attr.aria-label]="'Show teaching ' + ($index + 1)" [attr.aria-current]="$index === active() ? 'true' : null"></button>
          }
        </div>
        <button type="button" class="nav" (click)="go(1)" aria-label="Next teaching">›</button>
      </div>
      <a class="btn btn-gold" routerLink="/aghorvani">सभी वाणियाँ पढ़ें — Read All →</a>
    </div>
  </section>`,
  styles: [`
  :host{display:block}
  .av{position:relative;overflow:hidden;color:var(--ivory);padding:clamp(3.5rem,7vw,5.5rem) 0;
    background:radial-gradient(circle at 50% 0%,rgba(178,138,75,.28),transparent 55%),radial-gradient(circle at 90% 100%,rgba(0,0,0,.35),transparent 50%),linear-gradient(180deg,#4a2420,#2c1a15)}
  .mark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 min(70vw,620px)/1 var(--serif-hi);color:var(--gold);opacity:.05;pointer-events:none;user-select:none}
  .head{position:relative;text-align:center;max-width:720px}
  .eyebrow{color:var(--gold);letter-spacing:.3em;font-size:.75rem;font-weight:600;margin:0 0 .5rem}
  h2{color:var(--ivory);font-size:clamp(2rem,4vw,2.9rem);margin:0}
  .sub{margin:.2rem 0 0;color:var(--gold);font:500 1.3rem var(--serif-hi)}
  .track{position:relative;display:flex;gap:1.4rem;overflow-x:auto;scrollbar-width:none;overscroll-behavior-x:contain;margin-top:2rem;padding:1.2rem 0 2rem}
  .track::-webkit-scrollbar{display:none}
  .slot{flex:0 0 min(70vw,250px)}
  .foot{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.4rem}
  .ctl{display:flex;align-items:center;gap:1rem}
  .nav{width:42px;height:42px;border-radius:50%;border:1px solid var(--gold);background:var(--maroon);color:var(--gold);
    font:400 1.8rem/1 var(--serif);cursor:pointer;display:grid;place-items:center;padding-bottom:.2rem;flex:none;transition:background .2s,color .2s}
  .nav:hover{background:var(--gold);color:var(--brown)}
  .dots{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center}
  .dot{width:11px;height:11px;border-radius:50%;border:1px solid var(--gold);background:transparent;padding:0;cursor:pointer;position:relative;transition:transform .2s,background .2s}
  .dot::after{content:"";position:absolute;inset:-14px}
  .dot.on{background:var(--gold);transform:scale(1.25)}`],
})
export class AghorvaniComponent implements AfterViewInit {
  quotes = QUOTES;
  loop = Array.from({ length: COPIES }, (_, c) => QUOTES.map((q, n) => ({ q, n, dup: c !== 1 }))).flat();
  active = signal(0);
  @ViewChild('track') track!: ElementRef<HTMLElement>;

  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private held = false;
  private pending = 0;                       // px still to glide after an arrow / dot click
  private touchTimer?: ReturnType<typeof setTimeout>;
  private pos = 0;                           // authoritative scroll position (scrollLeft can round)

  private step() {
    const s = this.track.nativeElement.querySelector('.slot') as HTMLElement | null;
    return s ? s.offsetWidth + (parseFloat(getComputedStyle(this.track.nativeElement).columnGap) || 22) : 272;
  }
  private setW() { return this.step() * this.quotes.length; }

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;
    const t = this.track.nativeElement;
    this.pos = t.scrollLeft = this.setW();                   // start at the first card of the middle set
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let inView = true, last = performance.now(), raf = 0;
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([e]) => inView = e.isIntersecting, { threshold: 0.1 }) : undefined;
    io?.observe(t);

    const frame = (now: number) => {
      const dt = Math.min(now - last, 64); last = now;
      if (this.held) this.pos = t.scrollLeft;                // follow the visitor's finger / drag
      else if (inView && document.visibilityState === 'visible') {
        let d = reduce ? 0 : SPEED * dt;                     // right → left drift
        if (this.pending) { const k = this.pending * 0.14; d += Math.abs(k) < .5 ? this.pending : k; this.pending -= Math.abs(k) < .5 ? this.pending : k; }
        this.pos += d;
        const w = this.setW();
        while (this.pos >= 2 * w) this.pos -= w;             // jump by exactly one set: looks identical
        while (this.pos < w) this.pos += w;
        t.scrollLeft = this.pos;
      }
      const idx = Math.round(((this.pos - this.setW()) / this.step()) % this.quotes.length + this.quotes.length) % this.quotes.length;
      if (idx !== this.active()) this.zone.run(() => this.active.set(idx));
      raf = requestAnimationFrame(frame);
    };
    this.zone.runOutsideAngular(() => { raf = requestAnimationFrame(frame); });
    this.destroyRef.onDestroy(() => { cancelAnimationFrame(raf); clearTimeout(this.touchTimer); io?.disconnect(); });
  }

  private resume(ms: number) {
    clearTimeout(this.touchTimer);
    this.touchTimer = setTimeout(() => { this.pos = this.track.nativeElement.scrollLeft; this.held = false; }, ms);
  }
  hold() { this.held = true; this.resume(8000); }      // safety net if the "up" event never arrives
  release() { this.resume(HOLD_MS); }

  go(d: number) { this.pending += d * this.step(); }
  toIndex(i: number) {
    const n = this.quotes.length;
    let diff = (i - this.active() + n) % n; if (diff > n / 2) diff -= n;
    this.pending += diff * this.step();
  }
}

/* ───────────────────────── /aghorvani page: every teaching ───────────────────────── */
@Component({
  selector: 'app-aghorvani-full',
  imports: [RouterLink, VaniCardComponent],
  template: `
  <section class="hero" aria-labelledby="avp-h">
    <span class="mark" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container">
      <p class="eyebrow">AGHORVANI</p>
      <h1 id="avp-h">Aghorvani</h1>
      <div class="orn" aria-hidden="true"><i></i></div>
      <p class="sub" lang="hi">अघोरेश्वर वाणी</p>
    </div>
  </section>
  <section class="section list" aria-label="All teachings">
    <div class="container">
      <div class="grid g">
        @for (q of quotes; track $index) { <app-vani-card [n]="$index" [q]="q" [full]="true"/> }
      </div>
      <p class="auth" lang="hi">{{ note }}</p>
      <div style="text-align:center;margin-top:1.5rem"><a class="btn btn-maroon" routerLink="/">← Back to Home</a></div>
    </div>
  </section>`,
  styles: [`
  :host{display:block}
  .hero{position:relative;overflow:hidden;text-align:center;color:var(--ivory);padding:clamp(3rem,7vw,5rem) 0 clamp(2.2rem,5vw,3.5rem);
    background:radial-gradient(circle at 50% 0%,rgba(178,138,75,.3),transparent 55%),linear-gradient(180deg,#4a2420,#2c1a15);border-bottom:3px solid var(--gold)}
  .mark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 min(60vw,420px)/1 var(--serif-hi);color:var(--gold);opacity:.07;pointer-events:none}
  .container{position:relative}
  .eyebrow{color:var(--gold);letter-spacing:.3em;font-size:.75rem;font-weight:600;margin:0 0 .5rem}
  h1{color:var(--ivory);font-size:clamp(2.2rem,5vw,3.4rem);margin:0}
  .sub{margin:.2rem 0 0;color:var(--gold);font:500 1.35rem var(--serif-hi)}
  .list{background:linear-gradient(180deg,#3a2019,#2c1a15)}
  .g{grid-template-columns:repeat(auto-fill,minmax(min(100%,270px),1fr));gap:1.6rem;justify-items:stretch}
  .auth{max-width:760px;margin:3rem auto 0;text-align:center;color:var(--sand);border-top:1px solid rgba(178,138,75,.5);padding-top:1.4rem;font-size:1.02rem}`],
})
export class AghorvaniFullComponent {
  quotes = QUOTES;
  note = QUOTES_NOTE;
}
