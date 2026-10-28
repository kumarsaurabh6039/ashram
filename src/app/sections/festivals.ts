import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageLangService } from '../core/page-lang';
import { B, FEST_CARDS, FEST_EXTS, FEST_FOLDER, FEST_VIDEO_EXTS, FestivalCard, FPhoto } from '../core/festivals.data';

const VIDEOS = new Set(FEST_CARDS.flatMap(c => c.sections.flatMap(x => x.photos.filter(p => p.video).map(p => p.file))));

/** Home-page festival cards. “Learn more” opens a full popup (Hindi / English) with details and photos. */
@Component({
  selector: 'app-festivals',
  imports: [RouterLink],
  template: `<section id="festivals" class="section alt fx" aria-labelledby="fe-h"><div class="container">
    <header class="fx-head">
      <p class="fx-kicker" lang="hi">पर्व एवं उत्सव</p>
      <h2 id="fe-h">Our Festivals and Celebrations</h2>
      <div class="orn" aria-hidden="true"><i></i></div>
      <p>Explore the spiritual occasions and festivals observed by the Ashram.</p>
    </header>

    <div class="fx-grid">
      @for (f of cards; track f.id; let i = $index) {
        <article class="fx-card" [class.multi]="f.sections.length > 1">
          <span class="fx-mark" aria-hidden="true" lang="hi">ॐ</span>
          <div class="fx-top">
            <span class="fx-ico" aria-hidden="true">
              @switch (f.icon) {
                @case ('moon') { <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="24" cy="24" r="9"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.9 9.9l4.2 4.2M33.9 33.9l4.2 4.2M9.9 38.1l4.2-4.2M33.9 14.1l4.2-4.2"/></svg> }
                @case ('diya') { <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5c5 6 7 10 7 14a7 7 0 0 1-14 0c0-4 2-8 7-14z"/><path d="M6 28h36c0 8-7 14-18 14S6 36 6 28z"/></svg> }
                @case ('ashram') { <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 42V24a18 18 0 0 1 36 0v18M15 42V25a9 9 0 0 1 18 0v17M3 42h42M24 4V1"/></svg> }
                @case ('sparkle') { <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 6l4.2 13.8L40 24l-13.8 4.2L22 42l-4.2-13.8L4 24l13.8-4.2z"/><circle cx="39" cy="9" r="2.2"/><circle cx="40" cy="38" r="1.6"/></svg> }
                @case ('lotus') { <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M24 8c6 5 8 12 0 24-8-12-6-19 0-24z"/><path d="M24 32C15 31 8 25 6 17c8 0 14 4 18 15zM24 32c9-1 16-7 18-15-8 0-14 4-18 15z"/><path d="M8 40c10 4 22 4 32 0"/></svg> }
              }
            </span>
            <span class="fx-no">0{{ i + 1 }}</span>
          </div>
          <p class="fx-when"><span lang="hi">{{ f.when[0] }}</span><span class="dot">•</span>{{ f.when[1] }}</p>

          @if (f.sections.length > 1) {
            <div class="fx-parts">
              @for (s of f.sections; track s.id; let k = $index) {
                <div class="fx-part">
                  <h3 lang="hi">{{ s.title[0] }}</h3>
                  <p class="fx-en">{{ s.title[1] }}</p>
                  <p class="fx-txt">{{ s.short }}</p>
                  <button type="button" class="fx-btn" (click)="show(f, k)" [attr.aria-label]="'Learn more: ' + s.title[1]">Learn more <span lang="hi">· और जानें</span> <i aria-hidden="true">→</i></button>
                </div>
              }
            </div>
          } @else {
            <h3 lang="hi">{{ f.title[0] }}</h3>
            <p class="fx-en">{{ f.title[1] }}</p>
            <p class="fx-txt">{{ f.sections[0].short }}</p>
            <button type="button" class="fx-btn" (click)="show(f, 0)" [attr.aria-label]="'Learn more: ' + f.title[1]">Learn more <span lang="hi">· और जानें</span> <i aria-hidden="true">→</i></button>
          }
        </article>
      }
    </div>

    <!-- ═════════ popup ═════════ -->
    <dialog #dlg class="fm" [attr.aria-label]="cur() ? cur()!.title[1] : 'Festival'" (click)="backdrop($event)" (close)="onClosed()" (cancel)="onCancel($event)" (keydown)="onKey($event)">
      @if (cur(); as c) { @if (sec(); as s) {
        <div class="shell">
          <div class="top">
            <div class="lang" role="group" aria-label="Language / भाषा">
              <button type="button" [class.on]="L.lang() === 'en'" [attr.aria-pressed]="L.lang() === 'en'" (click)="setLang('en')">English</button>
              <button type="button" lang="hi" [class.on]="L.lang() === 'hi'" [attr.aria-pressed]="L.lang() === 'hi'" (click)="setLang('hi')">हिन्दी</button>
            </div>
            <button type="button" class="x" (click)="dlg.close()" [attr.aria-label]="T(ui.close)">×</button>
          </div>

          @if (c.sections.length > 1) {
            <div class="tabs" role="tablist" [attr.aria-label]="T(c.title)">
              @for (x of c.sections; track x.id; let k = $index) {
                <button type="button" role="tab" [attr.aria-selected]="k === tab()" [class.on]="k === tab()" (click)="pick(k)">{{ T(x.label) }}</button>
              }
            </div>
          }

          <div #scroller class="scroll" [attr.lang]="L.lang()">
            <!-- banner -->
            <header class="hero" [class.noimg]="!heroFile()">
              @if (heroFile(); as hf) { <img class="hbg" [src]="u(hf)" alt="" aria-hidden="true" (error)="bad(hf)"> }
              @else { <span class="om" aria-hidden="true" lang="hi">ॐ</span> }
              <div class="hshade"></div>
              <div class="hgrid">
                <div class="htxt">
                  <span class="chip">{{ T(s.date) }}</span>
                  <h2>{{ T(s.title) }}</h2>
                  <p class="hsub" lang="hi" aria-hidden="true">{{ s.title[0] }}</p>
                </div>
                @if (heroFile(); as hf) {
                  <button type="button" class="frame" [style.--ar]="ar()" (click)="zoom.set(hf)" [attr.aria-label]="T(ui.open) + ': ' + T(s.photos[0].cap)">
                    <img [src]="u(hf)" [alt]="T(s.photos[0].cap)" (load)="onHero($event)" (error)="bad(hf)">
                  </button>
                }
              </div>
            </header>

            <div class="wrap">
              @for (p of s.intro; track $index; let first = $first) { <p [class.lead]="first">{{ T(p) }}</p> }

              @if (s.stats?.length) {
                <ul class="stats">
                  @for (st of s.stats; track st.v) { <li><strong>{{ st.v }}</strong><span>{{ T(st.l) }}</span></li> }
                </ul>
              }

              <h3 class="sh"><span>{{ T(ui.happens) }}</span></h3>
              <div class="hl">
                @for (h of s.highlights; track h.t[1]) {
                  <div class="hc"><span class="hi" aria-hidden="true">{{ h.i }}</span><div><h4>{{ T(h.t) }}</h4><p>{{ T(h.d) }}</p></div></div>
                }
              </div>

              <h3 class="sh"><span>{{ T(ui.gallery) }}</span></h3>
              @if (shown().length) {
                <div class="gal">
                  @for (p of shown(); track p.file; let k = $index) {
                    <button type="button" class="ph" [class.big]="k === 0" [class.d2]="wide(k) === 2" [class.d3]="wide(k) === 3" [class.m2]="k > 0 && k === shown().length - 1 && shown().length % 2 === 0" (click)="zoom.set(p.file)" [attr.aria-label]="T(ui.open) + ': ' + T(p.cap)">
                      @if (p.video) {
                        <video [src]="u(p.file) + '#t=0.1'" muted playsinline preload="metadata" aria-hidden="true" (error)="bad(p.file)"></video>
                        <span class="play" aria-hidden="true">▶</span>
                      } @else {
                        <img [src]="u(p.file)" [alt]="T(p.cap)" loading="lazy" (error)="bad(p.file)">
                      }
                      <span class="cap">{{ T(p.cap) }}</span>
                    </button>
                  }
                </div>
              } @else {
                <div class="soon">{{ T(ui.soon) }}</div>
              }

              <p class="vande" lang="hi">॥ अघोरेश्वर वंदे जगत् गुरुम् ॥</p>
              <div class="cta">
                <a class="btn btn-maroon" routerLink="/contact" (click)="dlg.close()">{{ T(ui.contact) }}</a>
                <a class="btn btn-line" routerLink="/donation" (click)="dlg.close()">♥ {{ T(ui.donate) }}</a>
              </div>
            </div>
          </div>

          <!-- photo viewer -->
          @if (zoom(); as zf) {
            <div class="lb" role="dialog" aria-modal="true" [attr.aria-label]="T(ui.open)" (click)="zoom.set(null)">
              @if (isVid(zf)) {
                <video [src]="u(zf)" controls autoplay playsinline preload="auto" [attr.aria-label]="capOf(zf)" (click)="$event.stopPropagation()" (error)="bad(zf)"></video>
              } @else {
                <img [src]="u(zf)" [alt]="capOf(zf)" (click)="$event.stopPropagation()">
              }
              <p class="lbcap" (click)="$event.stopPropagation()">{{ capOf(zf) }}</p>
              @if (shown().length > 1) {
                <button type="button" class="nav prev" (click)="step(-1); $event.stopPropagation()" aria-label="Previous">‹</button>
                <button type="button" class="nav next" (click)="step(1); $event.stopPropagation()" aria-label="Next">›</button>
              }
              <button type="button" class="lbx" (click)="zoom.set(null); $event.stopPropagation()" [attr.aria-label]="T(ui.close)">✕</button>
            </div>
          }
        </div>
      } }
    </dialog>
  </div></section>`,
  styles: [`
  /* ───────── section + cards ───────── */
  .fx{position:relative;overflow:hidden;background:radial-gradient(circle at 50% 0%,rgba(178,138,75,.18),transparent 55%),var(--sand)}
  .fx-head{text-align:center;max-width:720px;margin:0 auto 3rem}
  .fx-head h2{font-size:clamp(2rem,4.2vw,3rem);margin-bottom:.3em}
  .fx-head p:last-child{margin:.4rem 0 0}
  .fx-kicker{margin:0 0 .5rem;color:#8a6a35;letter-spacing:.22em;font-size:.82rem;font-weight:600}
  .fx-grid{display:grid;grid-template-columns:1fr;gap:clamp(1.1rem,2.4vw,1.8rem)}
  @media(min-width:720px){.fx-grid{grid-template-columns:repeat(2,1fr)}}
  .fx-card{position:relative;overflow:hidden;isolation:isolate;display:flex;flex-direction:column;
    padding:clamp(1.6rem,3vw,2.3rem);color:var(--ivory);
    background:radial-gradient(circle at 100% 0%,rgba(178,138,75,.28),transparent 55%),linear-gradient(160deg,#6b3a30 0%,#4a2420 55%,#2c1a15 100%);
    border:1px solid var(--gold);outline:1px solid rgba(178,138,75,.45);outline-offset:-9px;
    box-shadow:0 10px 30px rgba(53,36,31,.18);transition:transform .35s ease,box-shadow .35s ease}
  .fx-card::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
  .fx-card:hover,.fx-card:focus-within{transform:translateY(-6px);box-shadow:0 20px 44px rgba(53,36,31,.32)}
  .fx-mark{position:absolute;right:-.08em;bottom:-.22em;z-index:-1;font:700 clamp(9rem,22vw,15rem)/1 var(--serif-hi);color:var(--gold);opacity:.07;pointer-events:none;transition:opacity .35s,transform .5s}
  .fx-card:hover .fx-mark{opacity:.12;transform:scale(1.05) rotate(-3deg)}
  .fx-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.3rem}
  .fx-ico{display:grid;place-items:center;width:62px;height:62px;border-radius:50%;color:var(--gold);
    background:radial-gradient(circle,rgba(178,138,75,.22),rgba(0,0,0,.18));border:1.5px solid var(--gold);box-shadow:0 0 0 5px rgba(178,138,75,.12)}
  .fx-ico svg{width:32px;height:32px}
  .fx-no{font:700 clamp(2.4rem,5vw,3.4rem)/1 var(--serif);color:rgba(233,221,202,.22);letter-spacing:.02em}
  .fx-when{display:inline-flex;flex-wrap:wrap;align-items:center;gap:.15rem .55rem;align-self:flex-start;margin:0 0 1rem;
    padding:.3rem 1rem;border:1px solid var(--gold);border-radius:999px;background:rgba(0,0,0,.28);color:var(--gold);font-size:.84rem;font-weight:600;letter-spacing:.06em}
  .fx-when .dot{opacity:.6}
  .fx-card h3{color:var(--ivory);font:700 clamp(1.6rem,3vw,2.2rem)/1.3 var(--serif-hi);margin:0 0 .25rem}
  .fx-en{margin:0 0 .9rem;color:var(--gold);font:600 clamp(1.05rem,1.8vw,1.25rem)/1.4 var(--serif);letter-spacing:.02em}
  .fx-txt{margin:0 0 1.3rem;color:var(--sand);font-size:.98rem;line-height:1.75}
  .fx-parts{display:flex;flex-direction:column;flex:1}
  .fx-part{display:flex;flex-direction:column;flex:1;padding:1rem 0}
  .fx-part:first-child{padding-top:0;border-bottom:1px solid rgba(178,138,75,.45)}
  .fx-part:last-child{padding-bottom:0}
  .fx-part h3{font-size:clamp(1.35rem,2.4vw,1.75rem)}
  .fx-part .fx-txt{flex:1}
  .fx-card > .fx-txt{flex:1}
  .fx-btn{align-self:flex-start;display:inline-flex;align-items:center;gap:.5rem;min-height:46px;padding:.55rem 1.3rem;border:1.5px solid var(--gold);border-radius:999px;
    background:rgba(178,138,75,.12);color:var(--gold);font:600 .92rem var(--sans);letter-spacing:.03em;cursor:pointer;transition:background .2s,color .2s,gap .2s}
  .fx-btn i{font-style:normal;transition:transform .2s}
  .fx-btn:hover,.fx-btn:focus-visible{background:var(--gold);color:var(--brown)}
  .fx-btn:hover i{transform:translateX(4px)}
  /* two-occasion card: full width, one occasion on each side */
  @media(min-width:720px){
    .fx-card.multi{grid-column:1/-1}
    .fx-parts{display:grid;grid-template-columns:1fr 1fr}
    .fx-part,.fx-part:first-child,.fx-part:last-child{padding:0}
    .fx-part:first-child{border-bottom:0;border-right:1px solid rgba(178,138,75,.5);padding-right:clamp(1.2rem,3vw,2.6rem)}
    .fx-part:last-child{padding-left:clamp(1.2rem,3vw,2.6rem)}
  }
  @media(max-width:520px){.fx-ico{width:54px;height:54px}.fx-ico svg{width:28px;height:28px}.fx-card{outline-offset:-7px}.fx-btn{width:100%;justify-content:center}}

  /* ───────── popup ───────── */
  dialog.fm{width:min(1100px,94vw);max-width:none;height:min(92vh,920px);max-height:none;padding:0;overflow:hidden;border:1px solid var(--gold);background:var(--ivory);position:fixed}
  .shell{display:flex;flex-direction:column;height:100%;position:relative}
  .top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.55rem .8rem .55rem 1.2rem;background:var(--maroon);border-bottom:2px solid var(--gold)}
  .lang{display:inline-flex;border:1px solid var(--gold);border-radius:999px;overflow:hidden}
  .lang button{min-height:40px;min-width:92px;padding:.3rem 1.1rem;border:0;background:transparent;color:var(--sand);font:500 .92rem var(--sans);cursor:pointer}
  .lang button.on{background:var(--gold);color:var(--brown);font-weight:600}
  .top .x{width:44px;height:44px;border:0;background:transparent;color:var(--ivory);font-size:1.9rem;line-height:1;cursor:pointer}
  .tabs{flex:none;display:flex;gap:.4rem;padding:.6rem .8rem 0;background:var(--sand);border-bottom:1px solid var(--gold);overflow-x:auto;scrollbar-width:none}
  .tabs::-webkit-scrollbar{display:none}
  .tabs button{flex:1 1 0;min-width:max-content;min-height:46px;padding:.5rem 1.1rem;border:1px solid var(--gold);border-bottom:0;border-radius:10px 10px 0 0;background:transparent;color:var(--maroon);font:600 .95rem var(--sans);cursor:pointer;white-space:nowrap}
  .tabs button.on{background:var(--maroon);color:var(--gold)}
  .scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;background:var(--ivory)}

  .hero{position:relative;overflow:hidden;color:var(--ivory);background:linear-gradient(160deg,#6b3a30,var(--brown))}
  .hero.noimg{min-height:clamp(200px,28vw,300px);display:flex;align-items:flex-end}
  .hbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(26px) brightness(.5) saturate(1.1);transform:scale(1.2)}
  .om{position:absolute;inset:0;display:grid;place-items:center;font:700 min(60vw,340px)/1 var(--serif-hi);color:var(--gold);opacity:.12}
  .hshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(30,16,12,.72) 0%,rgba(30,16,12,.35) 60%,rgba(30,16,12,.55) 100%)}
  /* text on the left, photo on the right — two separate columns, so they can never overlap */
  .hgrid{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:clamp(1.4rem,3.5vw,3rem);
    padding:clamp(1.4rem,3vw,2.4rem) clamp(1.2rem,3.4vw,2.8rem);--fh:min(58vh,520px)}
  .hero.noimg .hgrid{width:100%}
  .htxt{min-width:0;align-self:end}
  .frame{display:block;padding:0;cursor:zoom-in;background:#1d100c;border:2px solid var(--gold);outline:1px solid rgba(178,138,75,.55);outline-offset:6px;
    box-shadow:0 16px 44px rgba(0,0,0,.6);overflow:hidden;
    width:min(calc(var(--fh) * var(--ar,1.25)),min(44vw,480px));aspect-ratio:var(--ar,1.25);margin:6px}
  .frame img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 24%;transition:transform .6s ease}
  .frame:hover img,.frame:focus-visible img{transform:scale(1.04)}
  .chip{display:inline-block;border:1px solid var(--gold);border-radius:999px;padding:.25rem 1rem;background:rgba(0,0,0,.35);color:var(--gold);font-size:.85rem;font-weight:600;letter-spacing:.06em}
  .htxt h2{color:var(--ivory);font-size:clamp(1.6rem,3.6vw,2.7rem);line-height:1.22;margin:.7rem 0 .25rem;text-shadow:0 2px 16px rgba(0,0,0,.55);overflow-wrap:anywhere}
  .hsub{margin:0;color:var(--sand);font:500 1.05rem var(--serif-hi)}

  .wrap{width:min(100%,980px);margin:0 auto;padding:clamp(1.4rem,3vw,2.4rem) clamp(1.1rem,3vw,2.2rem) 2.6rem}
  .wrap p{margin:0 0 1rem;max-width:72ch}
  .scroll:lang(hi) .wrap p{line-height:1.95}
  .lead{font:500 clamp(1.15rem,2vw,1.4rem)/1.65 var(--serif);color:var(--maroon)}
  .scroll:lang(hi) .lead{font-family:var(--serif-hi)}
  .stats{list-style:none;margin:1.6rem 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1rem}
  .stats li{background:var(--maroon);color:var(--ivory);border:1px solid var(--gold);outline:1px solid rgba(178,138,75,.5);outline-offset:-7px;padding:1.1rem 1.3rem;display:flex;align-items:center;gap:1rem}
  .stats strong{font:700 clamp(1.7rem,3.4vw,2.2rem)/1 var(--serif);color:var(--gold);flex:none}
  .stats span{font-size:.9rem;color:var(--sand);line-height:1.5}
  .sh{display:flex;align-items:center;gap:1rem;margin:2.4rem 0 1.2rem;font-size:clamp(1.4rem,2.6vw,1.85rem)}
  .sh::before,.sh::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold))}
  .sh::after{transform:scaleX(-1)}
  .hl{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem}
  .hc{display:flex;gap:1rem;align-items:flex-start;background:var(--white);border:1px solid var(--sand);border-left:3px solid var(--gold);padding:1.1rem 1.2rem;transition:transform .25s,box-shadow .25s}
  .hc:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(53,36,31,.13)}
  .hi{flex:none;display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--maroon);border:1px solid var(--gold);font-size:1.35rem}
  .hc h4{margin:0 0 .25rem;font:600 1.2rem/1.3 var(--serif);color:var(--maroon)}
  .scroll:lang(hi) .hc h4{font-family:var(--serif-hi)}
  .hc p{margin:0;font-size:.95rem;line-height:1.65}

  .gal{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:clamp(150px,19vw,215px);grid-auto-flow:dense;gap:.8rem}
  .ph{position:relative;display:block;padding:0;border:1px solid var(--gold);background:var(--brown);overflow:hidden;cursor:zoom-in;min-width:0}
  .ph.big{grid-column:span 2;grid-row:span 2}
  .ph.d2{grid-column:span 2}.ph.d3{grid-column:span 3}
  .ph img,.ph video{width:100%;height:100%;object-fit:cover;transition:transform .5s ease;pointer-events:none}
  .ph:hover img,.ph:focus-visible img,.ph:hover video{transform:scale(1.06)}
  .play{position:absolute;left:50%;top:50%;transform:translate(-50%,-60%);display:grid;place-items:center;width:62px;height:62px;padding-left:5px;border-radius:50%;background:rgba(53,36,31,.78);border:2px solid var(--gold);color:var(--gold);font-size:1.4rem;box-shadow:0 0 0 8px rgba(178,138,75,.18);transition:transform .25s,background .25s}
  .ph:hover .play{transform:translate(-50%,-60%) scale(1.1);background:var(--gold);color:var(--brown)}
  .cap{position:absolute;left:0;right:0;bottom:0;padding:1.4rem .8rem .55rem;text-align:left;font:500 .85rem/1.35 var(--sans);color:#fff;background:linear-gradient(transparent,rgba(30,16,12,.85))}
  .soon{border:1px dashed var(--gold);padding:1.4rem;text-align:center;background:rgba(255,255,255,.55);color:#6b6058}
  .vande{margin:2.4rem auto 1.2rem!important;max-width:none!important;text-align:center;font:700 clamp(1.3rem,2.8vw,1.9rem)/1.5 var(--serif-hi);color:var(--maroon);border-top:1px solid var(--gold);border-bottom:1px solid var(--gold);padding:.9rem 0;letter-spacing:.04em}
  .cta{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap}

  .lb{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;padding:3.5rem 1rem 2rem;background:rgba(20,10,8,.94)}
  .lb img,.lb video{max-width:100%;max-height:calc(100% - 3rem);object-fit:contain;border:1px solid var(--gold);background:#000}
  .lb video{width:min(100%,1000px)}
  .lbcap{margin:0;color:var(--sand);text-align:center;font-size:.95rem}
  .lbx,.nav{position:absolute;border:1px solid var(--gold);background:rgba(53,36,31,.85);color:var(--ivory);cursor:pointer;border-radius:50%;width:46px;height:46px;font-size:1.4rem;line-height:1}
  .lbx{top:.8rem;right:.8rem}
  .nav{top:50%;transform:translateY(-50%);font-size:2rem;padding-bottom:.25rem}
  .nav.prev{left:.8rem}.nav.next{right:.8rem}
  .lbx:hover,.nav:hover{background:var(--gold);color:var(--brown)}

  /* tablet */
  @media(max-width:900px){
    .frame{width:min(calc(var(--fh) * var(--ar,1.25)),40vw)}
  }
  /* mobile: full-screen sheet */
  @media(max-width:700px){
    dialog.fm{width:100vw;height:100dvh;max-height:100dvh;border:0}
    .top{padding:.45rem .6rem .45rem .9rem}.lang button{min-width:84px}
    .tabs{gap:.3rem;padding:.5rem .5rem 0}
    .tabs button{min-width:0;white-space:normal;line-height:1.25;font-size:.86rem;padding:.4rem .5rem}
    /* photo on top, text underneath — stacked, nothing on top of anything */
    .hgrid{grid-template-columns:1fr;justify-items:center;gap:1.1rem;padding:1.2rem 1rem 1.4rem;--fh:min(46dvh,400px)}
    .hshade{background:linear-gradient(180deg,rgba(30,16,12,.45) 0%,rgba(30,16,12,.75) 100%)}
    .frame{order:-1;width:min(100%,calc(var(--fh) * var(--ar,1.25)));outline-offset:5px;margin:5px}
    .htxt{justify-self:stretch;align-self:start}
    .gal{grid-template-columns:repeat(2,1fr);grid-auto-rows:clamp(120px,34vw,210px)}
    .ph.big{grid-column:span 2;grid-row:span 2}
    .ph.d2,.ph.d3{grid-column:auto}
    .ph.m2{grid-column:span 2}
    .stats{grid-template-columns:1fr}
    .cta .btn{flex:1 1 100%}
    .nav{width:42px;height:42px}
  }`],
})
export class FestivalsComponent {
  L = inject(PageLangService);
  cards = FEST_CARDS;

  cur = signal<FestivalCard | null>(null);
  tab = signal(0);
  zoom = signal<string | null>(null);
  /** width ÷ height of the banner photo, so the frame follows the picture (portrait stays portrait, landscape stays landscape) */
  ar = signal(1.25);
  /** per-file index into FEST_EXTS; >= length means "no such photo" */
  private st = signal<Record<string, number>>({});

  sec = computed(() => { const c = this.cur(); return c ? c.sections[this.tab()] ?? c.sections[0] : null; });
  /** photos of the open section that actually exist */
  shown = computed<FPhoto[]>(() => { const s = this.sec(); return s ? s.photos.filter(p => this.has(p.file)) : []; });
  /** banner photo = first photo of the section, if it exists */
  heroFile = computed(() => { const s = this.sec(); const p = s?.photos[0]; return p && !p.video && this.has(p.file) ? p.file : null; });

  ui = {
    close: ['बंद करें', 'Close'] as B,
    happens: ['इस दिन क्या होता है', 'What happens on this day'] as B,
    gallery: ['झलकियाँ', 'Photo Gallery'] as B,
    open: ['तस्वीर देखें', 'View photo'] as B,
    soon: ['तस्वीरें जल्द जोड़ी जाएँगी।', 'Photos will be added soon.'] as B,
    contact: ['संपर्क करें', 'Contact'] as B,
    donate: ['सहयोग करें', 'Donate'] as B,
  };

  @ViewChild('dlg') dlg!: ElementRef<HTMLDialogElement>;
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  /** Picks the Hindi or English half of a pair (reads the language signal, so the popup updates instantly). */
  T = (v: B) => (this.L.lang() === 'hi' ? v[0] : v[1]);

  /** Desktop gallery is 3 columns with a 2×2 lead photo. If the last row is not full, stretch the last tile so there is no hole. */
  wide(k: number): number {
    const n = this.shown().length;
    if (n < 4 || k !== n - 1) return 1;
    const left = (3 - ((n - 3) % 3)) % 3;
    return left ? 1 + left : 1;
  }
  isVid(file: string) { return VIDEOS.has(file); }
  private exts(file: string) { return VIDEOS.has(file) ? FEST_VIDEO_EXTS : FEST_EXTS; }
  u(file: string) { const e = this.exts(file); const i = Math.min(this.st()[file] ?? 0, e.length - 1); return `${FEST_FOLDER}${file}.${e[i]}`; }
  has(file: string) { return (this.st()[file] ?? 0) < this.exts(file).length; }
  /** image failed → try the next extension; after the last one the photo is hidden */
  bad(file: string) { this.st.update(m => ({ ...m, [file]: (m[file] ?? 0) + 1 })); }
  capOf(file: string) { const p = this.sec()?.photos.find(x => x.file === file); return p ? this.T(p.cap) : ''; }

  show(c: FestivalCard, tab = 0) {
    this.cur.set(c); this.tab.set(tab); this.zoom.set(null);
    this.dlg.nativeElement.showModal();
    this.toTop();
  }
  pick(i: number) { this.tab.set(i); this.zoom.set(null); this.toTop(); }
  setLang(l: 'en' | 'hi') { this.L.set(l); }
  step(d: number) {
    const list = this.shown(); const cur = this.zoom();
    if (!list.length || !cur) return;
    const i = list.findIndex(p => p.file === cur);
    this.zoom.set(list[(i + d + list.length) % list.length].file);
  }
  onHero(e: Event) {
    const i = e.target as HTMLImageElement;
    if (i.naturalWidth && i.naturalHeight) this.ar.set(Math.min(1.7, Math.max(0.85, i.naturalWidth / i.naturalHeight)));
  }
  private toTop() { setTimeout(() => this.scroller?.nativeElement.scrollTo({ top: 0 })); }

  backdrop(e: MouseEvent) { if (e.target === this.dlg.nativeElement) this.dlg.nativeElement.close(); }
  onClosed() { this.cur.set(null); this.zoom.set(null); }
  /** Esc closes the photo viewer first, then the popup. */
  onCancel(e: Event) { if (this.zoom()) { e.preventDefault(); this.zoom.set(null); } }
  onKey(e: KeyboardEvent) {
    if (!this.zoom()) return;
    if (e.key === 'ArrowRight') this.step(1);
    else if (e.key === 'ArrowLeft') this.step(-1);
  }
}