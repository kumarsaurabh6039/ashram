import { Component, DestroyRef, ElementRef, Input, ViewChild, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DONATE, SERVICES } from '../core/content';
import { SiteContentService } from '../core/content.service';
import { GalleryImage } from '../core/models';
import { SITE } from '../core/site.config';
import { MediaComponent, SectionHeadingComponent } from '../shared/shared';

const VIDEO_ID = 'S45BcNogRpM';
const TOUCH_RESUME_MS = 3000;

/**
 * Auto-rotate helper (call inside a constructor).
 * Runs only when: not hovered/focused/touched, tab visible, section on screen,
 * canTick() is true, and user has no reduced-motion preference.
 */
function autoRotate(everyMs: number, canTick: () => boolean, tick: () => void) {
  const host = inject(ElementRef).nativeElement as HTMLElement;
  const destroyRef = inject(DestroyRef);
  const hover = signal(false);
  const inView = signal(true);
  const tabVisible = signal(true);
  let touchTimer: ReturnType<typeof setTimeout> | undefined;

  const enabled = typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (enabled) {
    const id = setInterval(() => {
      if (!hover() && tabVisible() && inView() && canTick()) tick();
    }, everyMs);

    const onVis = () => tabVisible.set(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => inView.set(e.isIntersecting), { threshold: 0.2 });
      io.observe(host);
    }

    destroyRef.onDestroy(() => {
      clearInterval(id);
      clearTimeout(touchTimer);
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    });
  }

  return {
    enabled,
    enter: () => hover.set(true),
    leave: () => hover.set(false),
    touchHold: () => { clearTimeout(touchTimer); hover.set(true); },
    touchRelease: () => { clearTimeout(touchTimer); touchTimer = setTimeout(() => hover.set(false), TOUCH_RESUME_MS); },
  };
}

@Component({
  selector: 'app-foundation',
  imports: [SectionHeadingComponent],
  template: `<section id="foundation" class="section" aria-labelledby="f-h"><div class="container" style="max-width:820px;text-align:center">
    <app-section-heading title="Our Foundation" subtitle="Dedicated to service and the welfare of the community."/>
    <p class="big">Aghor Peeth Janseva Abhed Ashram Trust was established on 12 June 2008 by Param Pujya Dharm Rakshit Baba Kapalik Ram Ji.</p></div></section>`,
  styles: [`.big{font:500 clamp(1.3rem,2.6vw,1.8rem)/1.6 var(--serif);color:var(--maroon)}`],
})
export class FoundationComponent {}

@Component({
  selector: 'app-services-section',
  imports: [RouterLink, SectionHeadingComponent, MediaComponent],
  template: `<section id="initiatives" class="section alt" aria-labelledby="s-h"><div class="container">
    <app-section-heading title="How We Can Help You"/>
    <div class="grid cards">@for (s of items; track s.title) {
      <article class="card"><div class="thumb"><app-media [src]="s.image" [alt]="s.title"/></div>
        <div class="card-body"><span class="tag">{{ s.tag }}</span><h3>{{ s.title }}</h3><p>{{ s.text }}</p>
          <a class="btn btn-line" [routerLink]="s.path" style="margin-top:auto;align-self:flex-start">Learn More</a></div></article>}
    </div></div></section>`,
  styles: [`.cards{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}`],
})
export class ServicesSectionComponent { items = SERVICES; }

@Component({
  selector: 'app-donation-section',
  imports: [RouterLink, SectionHeadingComponent],
  template: `<section id="donate" class="section" aria-labelledby="d-h"><div class="container">
    <app-section-heading title="Make a Difference Through Your Support"/>
    <div class="grid cards">@for (d of items; track d.title) {
      <article class="card"><div class="card-body"><h3>{{ d.title }}</h3><p>{{ d.text }}</p>
        <a class="btn btn-gold" routerLink="/donation" style="margin-top:auto;align-self:flex-start">Donate</a></div></article>}
    </div></div></section>`,
  styles: [`.cards{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.card{border-top:3px solid var(--gold)}`],
})
export class DonationSectionComponent { items = DONATE; }

/** Festival cards + “Learn more” popup live in ./festivals.ts (data: ../core/festivals.data.ts). */
export { FestivalsComponent } from './festivals';

@Component({
  selector: 'app-students',
  imports: [MediaComponent],
  template: `<section id="students" class="section" aria-labelledby="st-h"><div class="container two">
    <div>
      <div class="im"
           (mouseenter)="auto.enter()" (mouseleave)="auto.leave()"
           (focusin)="auto.enter()" (focusout)="auto.leave()"
           (touchstart)="auto.touchHold()" (touchend)="auto.touchRelease()" (touchcancel)="auto.touchRelease()">
        @if (playing()) {
          <iframe [src]="videoUrl" title="Ashram video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        } @else {
          @for (s of [idx()]; track s) {
            <div class="slide">
              @if (current().kind === 'video') {
                <button type="button" class="vbtn" (click)="play()" aria-label="Play video">
                  <img [src]="thumb" alt="Ashram video thumbnail" loading="lazy">
                  <span class="play" aria-hidden="true">▶</span>
                </button>
              } @else {
                <app-media [src]="img" alt="Students of the Ashram"/>
              }
            </div>
          }
        }
      </div>
      <div class="ctrl">
        @for (s of slides; track $index) {
          <button type="button" class="dot" [class.on]="$index === idx()" (click)="goTo($index)"
                  [attr.aria-label]="s.kind === 'video' ? 'Show video' : 'Show photo'"
                  [attr.aria-current]="$index === idx() ? 'true' : null"></button>
        }
      </div>
    </div>
    <div><h2 id="st-h">Celebrating Our Students' Achievements</h2><div class="orn" style="justify-content:flex-start" aria-hidden="true"><i></i></div>
      <p>Children of the Ashram who scored 80 percent and above were rewarded with a memorable trip to Visakhapatnam. The journey was filled with enriching experiences, celebrating their dedication and hard work. It was not just a trip, but a well-earned reward for their academic achievements.</p></div>
  </div></section>`,
  styles: [`
  :host{display:block}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,4rem);align-items:center}
  .im{position:relative;aspect-ratio:16/9;border:1px solid var(--gold);padding:8px;background:#fff;overflow:hidden}
  .slide{height:100%;animation:fadeIn .7s ease both}
  .slide app-media{display:block;height:100%}
  .vbtn{position:relative;display:block;width:100%;height:100%;padding:0;border:0;background:#000;cursor:pointer}
  .vbtn img{width:100%;height:100%;object-fit:cover;opacity:.9}
  .play{position:absolute;inset:0;margin:auto;width:68px;height:68px;border-radius:50%;background:var(--maroon);color:var(--ivory);display:grid;place-items:center;font-size:1.5rem;padding-left:4px;border:2px solid var(--gold);transition:transform .2s}
  .vbtn:hover .play,.vbtn:focus-visible .play{transform:scale(1.1)}
  iframe{width:100%;height:100%;border:0}
  @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  .ctrl{display:flex;justify-content:center;gap:.6rem;margin-top:1rem}
  .dot{width:14px;height:14px;border-radius:50%;border:1px solid var(--gold);background:transparent;padding:0;cursor:pointer;position:relative}
  .dot::after{content:"";position:absolute;inset:-15px}
  .dot.on{background:var(--maroon);border-color:var(--maroon)}
  @media(max-width:800px){.two{grid-template-columns:1fr}}`],
})
export class StudentsComponent {
  img = SITE.studentsImage;
  thumb = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;
  videoUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`);

  slides: { kind: 'video' | 'image' }[] = [{ kind: 'video' }, { kind: 'image' }];
  idx = signal(0);
  playing = signal(false);
  current = computed(() => this.slides[this.idx()]);

  // does not auto-rotate while the video is playing
  auto = autoRotate(6000, () => !this.playing(), () => this.idx.update(i => (i + 1) % this.slides.length));

  play() { this.playing.set(true); }
  goTo(i: number) { this.playing.set(false); this.idx.set(i); }
}

@Component({
  selector: 'app-gallery-section',
  imports: [SectionHeadingComponent, RouterLink],
  template: `<section id="gallery" class="section alt" aria-labelledby="g-h"><div class="container">
    <app-section-heading title="Gallery"/>
    @if (shown().length) {
      @if (!limit && cats().length > 1) {
        <div class="gf" role="group" aria-label="Filter photographs">
          <button type="button" [class.on]="!filter()" (click)="filter.set('')">All</button>
          @for (c of cats(); track c) { <button type="button" [class.on]="filter() === c" (click)="filter.set(c)">{{ c }}</button> }
        </div>
      }
      <div class="grid gg">@for (g of shown(); track g.src) {
        <button type="button" class="gi" (click)="show(g)" [attr.aria-label]="'Open image: ' + g.alt">
          <img [src]="g.src" [alt]="g.alt" loading="lazy" width="400" height="300">
          @if (g.caption) { <span class="gc">{{ g.caption }}</span> }
        </button>}</div>
      @if (limit && list().length > limit) { <p class="all"><a class="btn btn-line" routerLink="/gallery">View all photographs →</a></p> }
    } @else { <p class="empty">{{ loaded() ? 'Ashram photographs will appear here once added.' : 'Loading photographs…' }}</p> }
    <dialog #dlg aria-label="Image preview" (click)="dlg.close()"><div class="dlg">
      <button type="button" class="x" (click)="dlg.close()" aria-label="Close">×</button>
      @if (cur(); as c) { <img [src]="c.src" [alt]="c.alt" style="width:100%;height:auto;max-height:76vh;object-fit:contain">
        @if (c.caption) { <p style="margin:.75rem 0 0;text-align:center">{{ c.caption }}</p> } }</div></dialog>
  </div></section>`,
  styles: [`.gg{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
  .gi{position:relative;padding:0;border:1px solid var(--gold);background:none;cursor:pointer;overflow:hidden}
  .gi img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .5s ease}.gi:hover img{transform:scale(1.05)}
  .gc{position:absolute;left:0;right:0;bottom:0;padding:1.4rem .75rem .5rem;background:linear-gradient(transparent,rgba(35,22,18,.85));color:#fff;font-size:.85rem;text-align:left}
  .gf{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-bottom:1.5rem}
  .gf button{min-height:40px;padding:0 1rem;border:1px solid var(--gold);background:transparent;color:var(--maroon);font:500 .88rem var(--sans);cursor:pointer}
  .gf button.on{background:var(--maroon);border-color:var(--maroon);color:var(--ivory)}
  .all{text-align:center;margin:1.75rem 0 0}`],
})
export class GallerySectionComponent {
  /** 0 = show every photograph (Gallery page); a number = preview with a "View all" link (home page). */
  @Input() limit = 0;
  private content = inject(SiteContentService);
  loaded = this.content.galleryLoaded;
  filter = signal('');
  cur = signal<GalleryImage | null>(null);
  cats = computed(() => [...new Set(this.content.gallery().map((g) => g.category).filter((c): c is string => !!c))]);
  list = computed(() => this.content.gallery().filter((g) => !this.filter() || g.category === this.filter()));
  shown = computed(() => (this.limit ? this.list().slice(0, this.limit) : this.list()));
  @ViewChild('dlg') dlg!: ElementRef<HTMLDialogElement>;
  constructor() { this.content.start(); }
  show(g: GalleryImage) { this.cur.set(g); this.dlg.nativeElement.showModal(); }
}