import { Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../core/content.service';
import { NewsArticle } from '../core/models';
import { MediaComponent, SectionHeadingComponent } from '../shared/shared';

const EVERY_MS = 7000;   // how long each group of cards stays
const OUT_MS = 600;      // slide-up-and-vanish duration
const PAGE_SIZE = 4;     // 4 cards per group
const TOUCH_RESUME_MS = 3000;
const HOME_MAX = 12;     // the home slider shows the latest 12; /news shows everything

@Component({
  selector: 'app-news-section',
  imports: [RouterLink, SectionHeadingComponent, MediaComponent],
  template: `
  <section id="news" class="section" aria-labelledby="news-h">
    <div class="container">
      <app-section-heading title="Latest News" subtitle="आश्रम की नवीनतम गतिविधियाँ, विचार और समाचार" [subHi]="true"/>
      @if (pages().length) {
        <div class="viewport"
             (mouseenter)="hover.set(true)" (mouseleave)="hover.set(false)"
             (focusin)="hover.set(true)" (focusout)="hover.set(false)"
             (touchstart)="touchHold()" (touchend)="touchRelease()" (touchcancel)="touchRelease()">
          @for (t of [tick()]; track t) {
            <div class="grid news-grid slide" [class.out]="leaving()">
              @for (n of current(); track $index) {
                <article class="card">
                  <div class="thumb"><app-media [src]="n.image" [alt]="'Thumbnail for: ' + n.title"/></div>
                  <div class="card-body">
                    @if (n.category) { <span class="tag">{{ n.category }}</span> }
                    @if (n.date) { <time class="meta">{{ n.date }}</time> }
                    <h3><a [routerLink]="['/news', n.slug]">{{ n.title }}</a></h3>
                    <p>{{ n.excerpt }}</p>
                    <a class="more" [routerLink]="['/news', n.slug]">Read More →<span style="position:absolute;left:-999px"> about {{ n.title }}</span></a>
                  </div>
                </article>
              }
            </div>
          }
        </div>
        @if (pages().length > 1) {
          <div class="ctrl">
            @for (p of pages(); track $index) {
              <button type="button" class="dot" [class.on]="$index === page()" (click)="goTo($index)" [attr.aria-label]="'Show news group ' + ($index + 1)" [attr.aria-current]="$index === page() ? 'true' : null"></button>
            }
          </div>
        }
      } @else { <p class="empty">{{ loaded() ? 'No news available yet.' : 'Loading news…' }}</p> }
      @if (pages().length) { <p class="all"><a class="btn btn-line" routerLink="/news">View all news →</a></p> }
    </div>
  </section>`,
  styles: [`
  .viewport{overflow:hidden;padding:14px 0}
  .news-grid{grid-template-columns:repeat(4,1fr)}
  @media(max-width:1000px){.news-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:600px){.news-grid{grid-template-columns:1fr}}
  .slide{animation:slideIn .75s cubic-bezier(.2,.7,.2,1) both}
  .slide.out{animation:slideOut .6s ease-in both}
  @keyframes slideIn{from{opacity:0;transform:translateY(80px)}to{opacity:1;transform:none}}
  @keyframes slideOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-80px)}}
  .all{text-align:center;margin:1.5rem 0 0}
  .ctrl{display:flex;justify-content:center;align-items:center;gap:.6rem;margin-top:1.25rem;flex-wrap:wrap}
  .dot{width:14px;height:14px;border-radius:50%;border:1px solid var(--gold);background:transparent;padding:0;cursor:pointer;position:relative}
  .dot::after{content:"";position:absolute;inset:-15px}
  .dot.on{background:var(--maroon);border-color:var(--maroon)}`],
})
export class NewsSectionComponent {
  // Demo: repeat the available cards until there are 2 full pages
  private content = inject(SiteContentService);
  loaded = this.content.newsLoaded;
  all = computed<NewsArticle[]>(() => this.content.news().slice(0, HOME_MAX));

  page = signal(0);
  tick = signal(0);
  leaving = signal(false);
  hover = signal(false);      // mouse / keyboard focus / touch inside the cards
  inView = signal(true);      // section visible on screen
  tabVisible = signal(true);  // browser tab active
  canAuto = typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private touchTimer?: ReturnType<typeof setTimeout>;

  pages = computed<NewsArticle[][]>(() => {
    const out: NewsArticle[][] = [];
    const a = this.all();
    for (let i = 0; i < a.length; i += PAGE_SIZE) out.push(a.slice(i, i + PAGE_SIZE));
    return out;
  });
  current = computed(() => this.pages()[this.page()] ?? []);

  constructor() {
    this.content.start();
    if (!this.canAuto) return;

    const host = inject(ElementRef).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);

    // auto-run only while: not hovered, tab active, section on screen
    const id = setInterval(() => {
      if (this.pages().length > 1 && !this.hover() && this.tabVisible() && this.inView()) this.next();
    }, EVERY_MS);

    const onVis = () => this.tabVisible.set(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => this.inView.set(e.isIntersecting), { threshold: 0.2 });
      io.observe(host);
    }

    destroyRef.onDestroy(() => {
      clearInterval(id);
      clearTimeout(this.touchTimer);
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    });
  }

  touchHold() { clearTimeout(this.touchTimer); this.hover.set(true); }
  touchRelease() {
    clearTimeout(this.touchTimer);
    this.touchTimer = setTimeout(() => this.hover.set(false), TOUCH_RESUME_MS);
  }

  private swap(to: number) {
    if (this.leaving()) return;
    this.leaving.set(true);                                  // current group slides up and vanishes
    setTimeout(() => {
      this.page.set(to); this.tick.update(t => t + 1);       // next group re-created => slides in from below
      this.leaving.set(false);
    }, this.canAuto ? OUT_MS : 0);
  }
  next() { this.swap((this.page() + 1) % this.pages().length); }
  goTo(i: number) { if (i !== this.page()) this.swap(i); }
}