import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { INITIATIVES } from '../core/content';
import { PageLangService, UI } from '../core/page-lang';
import { SITE } from '../core/site.config';
import { LangToggleComponent } from '../shared/lang-toggle';
import { FarmingStoryComponent } from './farming-story';
import { HospitalStoryComponent } from './hospital-story';

@Component({
  selector: 'app-initiative-detail',
  imports: [RouterLink, FarmingStoryComponent, HospitalStoryComponent, LangToggleComponent],
  template: `
  @if (item(); as it) {
    <section class="hero" [attr.aria-label]="L.p(it.title)">
      <img class="hero-img" [src]="it.image" [alt]="it.imageAlt" fetchpriority="high">
      <div class="hero-shade"></div>
      <div class="container hero-in">
        <div class="top">
          <nav class="crumbs" aria-label="Breadcrumb" [attr.lang]="L.lang()">
            <a routerLink="/">{{ L.p(ui.home) }}</a><span aria-hidden="true">/</span>
            <a routerLink="/initiatives">{{ L.p(ui.initiatives) }}</a><span aria-hidden="true">/</span>
            <span aria-current="page">{{ L.p(it.title) }}</span>
          </nav>
          <app-lang-toggle/>
        </div>
        <div [attr.lang]="L.lang()">
          <span class="tag">{{ L.p(it.tag) }}</span>
          <h1>{{ L.p(it.title) }}</h1>
          <p class="tagline">{{ L.p(it.tagline) }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container two" [attr.lang]="L.lang()">
        <div>
          <h2>{{ L.p(ui.about) }}</h2>
          <div class="orn left" aria-hidden="true"><i></i></div>
          <p class="lead">{{ L.p(it.intro) }}</p>

          @if (it.highlights.length) {
            <ul class="ticks">@for (h of it.highlights; track h.en) { <li>{{ L.p(h) }}</li> }</ul>
          }
          @for (s of it.sections; track s.title.en) { <h3 class="sub">{{ L.p(s.title) }}</h3><p>{{ L.p(s.text) }}</p> }
          @if (!it.highlights.length && !it.sections.length) {
            <div class="soon"><strong>{{ L.p(ui.soon) }}</strong><p>{{ L.p(ui.soonText) }}</p></div>
          }
        </div>

        <aside class="side" [attr.aria-label]="L.p(ui.support)">
          <h3>{{ L.p(it.donateLabel) }}</h3>
          <p>{{ L.p(ui.helps) }}</p>
          <a class="btn btn-gold" routerLink="/donation">{{ L.p(ui.donate) }}</a>
          <hr>
          <p class="small">{{ L.p(ui.questions) }}</p>
          <a class="line" [href]="site.phoneHref">{{ site.phone }}</a>
          <a class="line" [href]="'mailto:' + site.email">{{ site.email }}</a>
        </aside>
      </div>
    </section>

    @if (it.slug === 'organic-farming') { <app-farming-story/> }
    @if (it.slug === 'hospital') { <app-hospital-story/> }

    @if (!rich() || it.gallery.length) {
    <section class="section alt" aria-labelledby="g-h">
      <div class="container" [attr.lang]="L.lang()">
        <div class="sec-head"><h2 id="g-h">{{ L.p(ui.gallery) }}</h2><div class="orn" aria-hidden="true"><i></i></div></div>
        @if (it.gallery.length) {
          <div class="gal">@for (g of it.gallery; track g) { <figure><img [src]="g" [alt]="L.p(it.title)" loading="lazy"></figure> }</div>
        } @else { <div class="empty">{{ L.p(ui.photosSoon) }}</div> }
      </div>
    </section>
    }

    <section class="section" aria-labelledby="o-h">
      <div class="container" [attr.lang]="L.lang()">
        <div class="sec-head"><h2 id="o-h">{{ L.p(ui.others) }}</h2><div class="orn" aria-hidden="true"><i></i></div></div>
        <div class="others">
          @for (o of others(); track o.slug) {
            <a class="other" [routerLink]="o.path">
              <img [src]="o.image" [alt]="o.imageAlt" loading="lazy">
              <span class="ov"></span>
              <span class="txt"><small>{{ L.p(o.tag) }}</small><strong>{{ L.p(o.title) }}</strong></span>
            </a>
          }
        </div>
      </div>
    </section>
  } @else {
    <section class="section"><div class="container" style="text-align:center">
      <h1>{{ L.p(ui.notFound) }}</h1>
      <a class="btn btn-maroon" routerLink="/">{{ L.p(ui.back) }}</a></div></section>
  }`,
  styles: [`
  :host{display:block}
  .hero{position:relative;min-height:clamp(340px,58vh,580px);display:flex;align-items:flex-end;overflow:hidden;background:var(--brown);color:var(--ivory)}
  .hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
  .hero-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(53,36,31,.5) 0%,rgba(53,36,31,.15) 35%,rgba(35,22,18,.88) 100%)}
  .hero-in{position:relative;padding-block:clamp(1.25rem,3vw,2.5rem);width:100%}
  .top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem 1rem;margin-bottom:clamp(2.5rem,9vw,6rem)}
  .hero h1{color:#fff;font-size:clamp(2.4rem,6vw,4.2rem);margin:.5rem 0 .25rem;text-shadow:0 2px 14px rgba(0,0,0,.4)}
  .tagline{margin:0;max-width:640px;font-size:clamp(1rem,2vw,1.25rem);color:var(--sand)}
  .crumbs{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.85rem;color:var(--sand)}
  .crumbs a{color:var(--sand);text-decoration:none}.crumbs a:hover{text-decoration:underline;color:#fff}
  .two{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:start}
  .orn.left{justify-content:flex-start;margin:.4rem 0 1.4rem}.orn.left::before{display:none}
  .lead{font:500 clamp(1.35rem,2.6vw,1.85rem)/1.55 var(--serif);color:var(--maroon);margin:0 0 1.25rem}
  :lang(hi).lead,.lead:lang(hi){font-family:var(--serif-hi);line-height:1.75}
  .sub{font-size:1.5rem;margin-top:1.75rem}
  .ticks{list-style:none;padding:0;margin:1.25rem 0;display:grid;gap:.6rem}
  .ticks li{position:relative;padding-left:1.7rem}
  .ticks li::before{content:"";position:absolute;left:.2rem;top:.7em;width:8px;height:8px;background:var(--gold);transform:rotate(45deg)}
  .soon{margin-top:1.5rem;padding:1.25rem 1.5rem;border-left:3px solid var(--gold);background:rgba(233,221,202,.45)}
  .soon strong{color:var(--maroon);font:600 1.2rem var(--serif)}.soon p{margin:.3rem 0 0}
  .side{position:sticky;top:calc(var(--header-h) + 1rem);background:#fff;border:1px solid var(--sand);border-top:3px solid var(--gold);padding:1.6rem;display:flex;flex-direction:column;gap:.6rem;align-items:flex-start}
  .side h3{margin:0;font-size:1.6rem}.side p{margin:0}.side .btn{margin-top:.5rem}
  .side hr{width:100%;border:0;border-top:1px solid var(--sand);margin:.9rem 0 .3rem}
  .small{font-size:.85rem;color:#6b6058}
  .line{font-weight:500;color:var(--maroon);overflow-wrap:anywhere}
  .gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
  .gal figure{margin:0;aspect-ratio:4/3;overflow:hidden;background:var(--brown)}
  .gal img{width:100%;height:100%;object-fit:cover}
  .others{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;max-width:880px;margin:0 auto}
  .other{position:relative;display:block;aspect-ratio:16/10;overflow:hidden;background:var(--brown);text-decoration:none}
  .other img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
  .other:hover img,.other:focus-visible img{transform:scale(1.05)}
  .ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(35,22,18,.85))}
  .txt{position:absolute;left:1.1rem;right:1.1rem;bottom:1rem;display:flex;flex-direction:column;color:#fff}
  .txt small{font-size:.78rem;letter-spacing:.06em;color:var(--sand)}
  .txt strong{font:600 1.6rem/1.2 var(--serif)}
  :lang(hi) .txt strong,.txt:lang(hi) strong{font-family:var(--serif-hi)}
  @media(max-width:900px){.two{grid-template-columns:1fr}.side{position:static}}
  @media(max-width:520px){.hero{min-height:320px}.side{padding:1.25rem}.side .btn{width:100%}}`],
})
export class InitiativeDetailComponent {
  site = SITE; ui = UI;
  L = inject(PageLangService);
  private data = toSignal(inject(ActivatedRoute).data);
  item = computed(() => INITIATIVES.find((i) => i.slug === this.data()?.['slug']));
  rich = computed(() => ['organic-farming', 'hospital'].includes(this.item()?.slug ?? ''));
  others = computed(() => INITIATIVES.filter((i) => i.slug !== this.item()?.slug));
  constructor(title: Title) {
    effect(() => {
      const it = this.item();
      title.setTitle(`${it ? this.L.p(it.title) : 'Not found'} | ${SITE.short}`);
    });
  }
}
