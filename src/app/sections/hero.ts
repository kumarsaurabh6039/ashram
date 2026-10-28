import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../core/site.config';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  template: `
  <section id="home" class="hero" aria-labelledby="h1">
    <div class="glow g1" aria-hidden="true"></div>
    <div class="glow g2" aria-hidden="true"></div>

    <div class="container wrap">
      <!-- Background: babaji.png with aura.png rotating on the raised hand -->
      <div class="fig">
        <div class="bb">
          <img #baba class="baba" src="assets/babaji.png" alt="Babaji with his hand raised in blessing" width="440" height="475" fetchpriority="high">
          <img class="aura" src="assets/aura.png" alt="" aria-hidden="true" width="426" height="416">
        </div>
      </div>

      <!-- Hero details directly on the background; guruji portrait on the right -->
      <div class="glass">
        <div class="txt">
          <p class="eyebrow">SEVA • SADHANA • HUMAN WELFARE</p>
          <h1 id="h1">Aghor Peeth Janseva</h1>
          <h2 class="ashram">Abhed Ashram</h2>
          <div class="rule" aria-hidden="true"></div>

          <div class="quote" role="group" aria-label="रमता है सो कौन, घट-घट में विराजत है। रमता है सो कौन, बता दे कोई!! — अघोरेश्वर भगवान राम">
            <div class="track" aria-hidden="true" lang="hi">
              @for (i of reps; track i) { <span [class.rep]="i > 0">“रमता है सो कौन, घट-घट में विराजत है। रमता है सो कौन, बता दे कोई!!” — अघोरेश्वर भगवान राम</span> }
              @for (i of reps; track i) { <span class="rep">“रमता है सो कौन, घट-घट में विराजत है। रमता है सो कौन, बता दे कोई!!” — अघोरेश्वर भगवान राम</span> }
            </div>
          </div>

          <p class="desc">Rooted in spiritual awareness, compassion, and humanity, Aghor Peeth Janseva Abhed Ashram Trust is committed to encouraging a life of simplicity, harmony, and selfless service to society.</p>
          <div class="actions">
            <a class="btn btn-gold" routerLink="/" fragment="gurus">Meet Our Guru</a>
            <a class="btn btn-light" routerLink="/" fragment="news">Latest News</a>
          </div>
        </div>

        <figure class="portrait">
          <div class="pbox">
            @if (img) { <img [src]="img" [alt]="name" fetchpriority="high"> }
            @else { <div class="ph" role="img" [attr.aria-label]="name + ' — portrait to be added'"><span>ॐ</span></div> }
          </div>
          <figcaption>{{ name }}</figcaption>
        </figure>
      </div>
    </div>
  </section>`,
  styles: [`
  .hero{position:relative;overflow:hidden;color:var(--ivory);--h:clamp(270px,min(60vh,22vw),520px);min-height:clamp(560px,86vh,800px);display:flex;align-items:stretch;
    background:linear-gradient(135deg,#2a1a16 0%,var(--maroon) 55%,var(--brown) 100%);border-bottom:2px solid var(--gold)}
  .glow{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none}
  .g1{width:520px;height:520px;left:-80px;bottom:-120px;background:rgba(178,138,75,.38)}
  .g2{width:460px;height:460px;right:6%;top:-120px;background:rgba(150,70,55,.5)}
  .wrap{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:stretch}

  .fig{position:relative;z-index:1;align-self:start;padding:2.5rem 0 0 3.5rem;margin-right:1rem}
  .bb{position:relative;display:inline-block;line-height:0}
  .baba{display:block;height:var(--h);width:auto;filter:drop-shadow(0 18px 36px rgba(0,0,0,.5))}
  .aura{position:absolute;left:21%;top:50%;width:70%;height:auto;pointer-events:none;mix-blend-mode:screen;opacity:.95;
    transform:translate(-50%,-50%);animation:aura 26s linear infinite}
  @keyframes aura{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}

  .glass{position:relative;z-index:2;margin:2.5rem 0 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(1.5rem,3vw,3rem);align-items:center;
    animation:pop .9s cubic-bezier(.2,.7,.2,1) both}
  @keyframes pop{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}

  .txt{min-width:0;align-self:center}
  .eyebrow{color:var(--gold);letter-spacing:.2em;font-size:.78rem;font-weight:600;margin:0 0 .7rem}
  h1{color:var(--ivory);font-size:clamp(2.2rem,4.3vw,3.9rem);margin:0;text-shadow:0 2px 14px rgba(0,0,0,.35)}
  .ashram{color:var(--gold);font-size:clamp(1.3rem,2.6vw,1.9rem);letter-spacing:.14em;text-transform:uppercase;margin:.25rem 0 0}
  .rule{width:90px;height:2px;background:var(--gold);margin:1.1rem 0}

  .quote{overflow:hidden;min-width:0;width:100%;border-top:1px solid rgba(178,138,75,.7);border-bottom:1px solid rgba(178,138,75,.7);padding:.6rem 0;margin:0 0 1.2rem;
    -webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
  .track{display:inline-flex;width:max-content;white-space:nowrap;animation:marquee 48s linear infinite}
  .track span{padding-right:4rem;font:600 clamp(1.05rem,1.6vw,1.3rem)/1.6 var(--serif-hi);color:#f1dfb8}
  @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @media (prefers-reduced-motion:reduce){.track{display:block;width:auto;white-space:normal}.track .rep{display:none}.quote{-webkit-mask-image:none;mask-image:none}}

  .desc{color:var(--sand);margin:0 0 1.6rem;max-width:560px;text-shadow:0 1px 8px rgba(0,0,0,.35)}
  .actions{display:flex;flex-wrap:wrap;gap:1rem}

  .portrait{margin:0;padding:0;width:max-content;max-width:100%;justify-self:end;align-self:end;position:relative;filter:drop-shadow(0 18px 36px rgba(0,0,0,.5))}
  /* photo box = exactly the size of the babaji image (measured in ngAfterViewInit) */
  .pbox{width:var(--bw,calc(var(--h) * .926));height:var(--bh,var(--h));max-width:100%;overflow:hidden}
  .pbox img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 20%}
  .ph{width:100%;height:100%;display:grid;place-items:center;font-size:3.5rem;color:var(--gold);border:1px dashed var(--gold)}
  figcaption{position:absolute;left:0;right:0;bottom:0;text-align:center;font:600 1.1rem/1.4 var(--serif);color:#f1dfb8;padding:2.4rem .5rem .8rem;background:linear-gradient(transparent,rgba(30,18,14,.88))}

  @media(max-width:1000px){
    .glass{grid-template-columns:1fr}
    .portrait{justify-self:center;align-self:auto}
  }
  @media(max-width:860px){
    .hero{min-height:0}
    .wrap{grid-template-columns:1fr}
    .fig{margin:0 auto;padding:1.5rem 0 0;text-align:center;align-self:auto}
    .baba{height:auto;width:min(68vw,300px)}
    .aura{width:78%}
    .glass{margin:1rem 0 0}
    figcaption{font-size:1rem;padding-top:2rem}
    .actions .btn{flex:1 1 150px}
  }`],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  img = SITE.guruImage; name = SITE.guruName;
  reps = [0, 1, 2];
  @ViewChild('baba') baba!: ElementRef<HTMLImageElement>;
  private host = inject(ElementRef<HTMLElement>);
  private ro?: ResizeObserver;

  /** Keep the guruji photo box exactly the same width/height as the babaji image, at every screen size. */
  ngAfterViewInit() {
    const img = this.baba.nativeElement, el = this.host.nativeElement as HTMLElement;
    const sync = () => {
      if (!img.offsetWidth) return;
      el.style.setProperty('--bw', img.offsetWidth + 'px');
      el.style.setProperty('--bh', img.offsetHeight + 'px');
    };
    this.ro = new ResizeObserver(sync);
    this.ro.observe(img);
    img.addEventListener('load', sync);
    sync();
  }
  ngOnDestroy() { this.ro?.disconnect(); }
}