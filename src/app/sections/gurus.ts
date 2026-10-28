import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { Bi, GURU_BIOS, GuruBio } from '../core/gurus.data';
import { SITE } from '../core/site.config';
import { SectionHeadingComponent } from '../shared/shared';

interface GuruCard { slug: string; name: string; image?: string; excerpt: string }
type Lang = 'en' | 'hi';

const bio = (slug: string) => GURU_BIOS.find(b => b.slug === slug)!;
const firstPara = (slug: string) => bio(slug).sections[0].p[0][1];   // English opening paragraph

/**
 * Photos shown on the card and in the popup.
 * Put the file in src/assets and set its path, e.g.  'aghoreshwar-bhagwan-ram': 'assets/babaji.png'
 */
const IMAGES: Record<string, string | undefined> = {
  'sri-kinaram-baba': 'assets/kinarambaba.png',
  'aghoreshwar-bhagwan-ram': encodeURI('assets/aughoreshwar babaji2.png'),
  'kapalik-ram': SITE.guruImage ?? undefined,
};

const CARDS: GuruCard[] = [
  { slug: 'sri-kinaram-baba', name: 'Aghoracharya Baba Kinaram',
    excerpt: 'The word Aghor literally means, that which is not difficult or terrible. Aghor is simple and natural state of consciousness. There is no place for feelings of fear, hatred, disgust or discrimination in the eyes of an Aughar.' },
  { slug: 'aghoreshwar-bhagwan-ram', name: 'Param Pujya Aghoreshwar Bhagwan Ram Ji', excerpt: firstPara('aghoreshwar-bhagwan-ram') },
  { slug: 'kapalik-ram', name: SITE.guruNameEn, excerpt: firstPara('kapalik-ram') },
].map(c => ({ ...c, image: IMAGES[c.slug] }));

@Component({
  selector: 'app-gurus-section',
  imports: [SectionHeadingComponent],
  template: `
  <section id="gurus" class="section alt" aria-labelledby="gurus-h">
    <div class="container">
      <app-section-heading title="Our Guru"/>
      <div class="grid g3">
        @for (g of cards; track g.slug) {
          <article class="guru">
            <div class="portrait">
              @if (g.image && !broken().includes(g.image)) { <img [src]="g.image" [alt]="g.name" width="400" height="500" loading="lazy" (error)="markBroken(g.image)"> }
              @else { <div class="mono" aria-hidden="true">ॐ</div> }
            </div>
            <div class="orn" aria-hidden="true"><i></i></div>
            <h3>{{ g.name }}</h3>
            <p class="clamp">{{ g.excerpt }}</p>
            <button type="button" class="btn btn-line" (click)="show(g.slug)">Read More →</button>
          </article>
        }
      </div>
    </div>

    <dialog #dlg class="bio" aria-labelledby="bio-t" (click)="backdrop($event)" (close)="cur.set(null)">
      @if (cur(); as b) {
        <div class="shell">
          <div class="top">
            <div class="lang" role="group" aria-label="Choose language">
              <button type="button" [class.on]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">English</button>
              <button type="button" lang="hi" [class.on]="lang() === 'hi'" [attr.aria-pressed]="lang() === 'hi'" (click)="setLang('hi')">हिन्दी</button>
            </div>
            <button type="button" class="x" (click)="dlg.close()" aria-label="Close">×</button>
          </div>
          <div class="body">
            <aside class="side">
              <div class="pic">
                @if (imageOf(b); as src) { <img [src]="src" [alt]="t(b.name)" (error)="markBroken(src)"> }
                @else { <div class="mono2" aria-hidden="true">ॐ</div> }
              </div>
            </aside>
            <article #scroller class="text" [attr.lang]="lang()">
              <h2 id="bio-t">{{ t(b.name) }}</h2>
              @if (b.subtitle) { <p class="sub">{{ t(b.subtitle) }}</p> }
              <div class="orn" aria-hidden="true"><i></i></div>
              @for (s of b.sections; track $index) {
                @if (s.h) { <h3>{{ t(s.h) }}</h3> }
                @for (p of s.p; track $index) { <p>{{ t(p) }}</p> }
              }
              @if (b.closing) { <p class="closing">{{ t(b.closing) }}</p> }
              @if (b.salutation) { <p class="salute">{{ t(b.salutation) }}</p> }
            </article>
          </div>
        </div>
      }
    </dialog>
  </section>`,
  styles: [`
  .g3{grid-template-columns:repeat(auto-fit,minmax(270px,1fr));align-items:stretch}
  .guru{text-align:center;display:flex;flex-direction:column;align-items:center;background:var(--ivory);border:1px solid var(--gold);padding:1.5rem 1.25rem 1.75rem;outline:1px solid var(--sand);outline-offset:-8px}
  .portrait{width:min(100%,240px);aspect-ratio:4/5;border-radius:999px 999px 0 0;overflow:hidden;border:1px solid var(--gold);background:var(--sand)}
  .portrait img{width:100%;height:100%;object-fit:cover;object-position:50% 25%}
  .mono{height:100%;display:grid;place-items:center;font-size:3.5rem;color:var(--gold);background:linear-gradient(160deg,#6b3a30,var(--brown))}
  .guru h3{font-size:1.45rem}
  .clamp{text-align:left;margin:0 0 1.25rem;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}
  .guru .btn{margin-top:auto}

  /* ── biography popup ── */
  dialog.bio{width:min(1040px,94vw);max-width:none;height:min(90vh,860px);max-height:none;padding:0;overflow:hidden;border:1px solid var(--gold);background:var(--ivory)}
  .shell{display:flex;flex-direction:column;height:100%}
  .top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.6rem .8rem .6rem 1.2rem;background:var(--maroon);border-bottom:2px solid var(--gold)}
  .lang{display:inline-flex;border:1px solid var(--gold);border-radius:999px;overflow:hidden}
  .lang button{min-height:40px;min-width:92px;padding:.3rem 1.1rem;border:0;background:transparent;color:var(--sand);font:500 .92rem var(--sans);cursor:pointer}
  .lang button.on{background:var(--gold);color:var(--brown);font-weight:600}
  .top .x{width:44px;height:44px;border:0;background:transparent;color:var(--ivory);font-size:1.9rem;line-height:1;cursor:pointer}
  .body{flex:1;min-height:0;display:grid;grid-template-columns:300px minmax(0,1fr)}
  .side{padding:1.5rem 1.25rem;background:var(--sand);border-right:1px solid var(--gold);display:flex;justify-content:center;align-items:flex-start;overflow:auto}
  .pic{width:100%;aspect-ratio:4/5;border:1px solid var(--gold);outline:1px solid rgba(178,138,75,.6);outline-offset:5px;background:var(--ivory);box-shadow:0 12px 26px rgba(53,36,31,.22);overflow:hidden;position:sticky;top:0}
  .pic img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 20%}
  .mono2{height:100%;display:grid;place-items:center;font-size:4rem;color:var(--gold);background:linear-gradient(160deg,#6b3a30,var(--brown))}
  .text{overflow:auto;overscroll-behavior:contain;padding:1.6rem clamp(1.2rem,3vw,2.4rem) 2.2rem}
  .text h2,.text h3{line-height:1.35}
  .text h2{font-size:clamp(1.6rem,3vw,2.3rem);margin:0 0 .3rem}
  .sub{margin:0;color:#8a6a35;font-weight:500}
  .text h3{font-size:1.35rem;margin:1.8rem 0 .5rem;padding-top:1.2rem;border-top:1px solid var(--sand)}
  .text p{margin:0 0 1rem;max-width:70ch}
  .text:lang(hi) p{font-size:1.05rem;line-height:1.95}
  .closing{font:600 1.15rem/1.7 var(--serif);color:var(--maroon);border-left:3px solid var(--gold);padding-left:1rem;margin-top:1.5rem!important}
  .text:lang(hi) .closing{font-family:var(--serif-hi)}
  .salute{text-align:center;color:#8a6a35;font-style:italic;margin-top:1.4rem!important;max-width:none!important}

  /* tablet */
  @media(max-width:900px){ .body{grid-template-columns:220px minmax(0,1fr)} .side{padding:1rem .8rem} }
  /* mobile: full-screen sheet, photo on top, one scroll area */
  @media(max-width:700px){
    dialog.bio{width:100vw;height:100dvh;max-height:100dvh;border:0}
    .top{padding:.5rem .6rem .5rem .9rem}
    .lang button{min-width:84px}
    .body{display:block;overflow:auto;overscroll-behavior:contain}
    .side{border-right:0;border-bottom:1px solid var(--gold);padding:1.2rem 1rem;overflow:visible}
    .pic{width:min(46%,170px);position:static}
    .text{overflow:visible;padding:1.2rem 1.1rem 2.5rem}
    .text h2{font-size:1.6rem}
  }`],
})
export class GurusSectionComponent {
  cards = CARDS;
  cur = signal<GuruBio | null>(null);
  lang = signal<Lang>('en');           // stays as the reader last chose it
  @ViewChild('dlg') dlg!: ElementRef<HTMLDialogElement>;
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  t(v: Bi) { return this.lang() === 'hi' ? v[0] : v[1]; }
  broken = signal<string[]>([]);       // images that failed to load fall back to the ॐ monogram
  markBroken(src: string) { this.broken.update(l => [...l, src]); }
  imageOf(b: GuruBio) { const s = IMAGES[b.slug]; return s && !this.broken().includes(s) ? s : undefined; }

  show(slug: string) {
    this.cur.set(bio(slug));
    this.dlg.nativeElement.showModal();
    this.toTop();
  }
  setLang(l: Lang) { this.lang.set(l); this.toTop(); }
  private toTop() {
    setTimeout(() => {
      this.scroller?.nativeElement.scrollTo({ top: 0 });
      this.dlg.nativeElement.querySelector('.body')?.scrollTo({ top: 0 });
    });
  }
  backdrop(e: MouseEvent) { if (e.target === this.dlg.nativeElement) this.dlg.nativeElement.close(); }
}