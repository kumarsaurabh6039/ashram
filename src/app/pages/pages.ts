import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NEWS } from '../core/content';
import { SiteContentService } from '../core/content.service';
import { NewsArticle } from '../core/models';
import { LoadMoreComponent, MediaComponent, SectionHeadingComponent } from '../shared/shared';
import { SITE } from '../core/site.config';
import { HeroComponent } from '../sections/hero';
import { NewsSectionComponent } from '../sections/news';
import { GurusSectionComponent } from '../sections/gurus';
import { AghorvaniComponent, AghorvaniFullComponent } from '../sections/aghorvani';
import { DonationSectionComponent, FestivalsComponent, FoundationComponent, GallerySectionComponent, ServicesSectionComponent, StudentsComponent } from '../sections/more';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, FoundationComponent, GurusSectionComponent, ServicesSectionComponent, DonationSectionComponent, FestivalsComponent, StudentsComponent, NewsSectionComponent, GallerySectionComponent, AghorvaniComponent],
  template: `<app-hero/><app-foundation/><app-gurus-section/><app-services-section/><app-donation-section/><app-festivals/><app-students/><app-aghorvani/><app-gallery-section [limit]="8"/><app-news-section/>`,
})
export class HomeComponent {
  constructor(t: Title, m: Meta) {
    t.setTitle(SITE.name);
    m.updateTag({ name: 'description', content: 'Aghor Peeth Janseva Abhed Ashram Trust — seva, sadhana and human welfare.' });
  }
}

@Component({
  selector: 'app-news-page',
  imports: [RouterLink, SectionHeadingComponent, MediaComponent, LoadMoreComponent],
  template: `<section class="section" aria-labelledby="np-h"><div class="container">
    <app-section-heading title="Latest News" subtitle="आश्रम की नवीनतम गतिविधियाँ, विचार और समाचार" [subHi]="true"/>
    @if (shown().length) {
      <div class="grid ng">@for (n of shown(); track n.slug) {
        <article class="card">
          <div class="thumb"><app-media [src]="n.image" [alt]="'Thumbnail for: ' + n.title"/></div>
          <div class="card-body">
            @if (n.category) { <span class="tag">{{ n.category }}</span> }
            @if (n.date) { <time class="meta">{{ n.date }}</time> }
            <h3><a [routerLink]="['/news', n.slug]">{{ n.title }}</a></h3>
            <p>{{ n.excerpt }}</p>
            <a class="more" [routerLink]="['/news', n.slug]">Read More →</a>
          </div>
        </article>}</div>
      <app-load-more [remaining]="all().length - count()" (more)="loadMore()"/>
    } @else { <p class="empty">{{ loaded() ? 'No news available yet.' : 'Loading news…' }}</p> }
  </div></section>`,
  styles: ['.ng{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}'],
})
export class NewsPageComponent {
  private content = inject(SiteContentService);
  loaded = this.content.newsLoaded;
  all = this.content.news;
  count = signal(12);
  shown = computed(() => this.all().slice(0, this.count()));
  loadMore() { this.count.update((c) => c + 12); }
  constructor(t: Title) { t.setTitle(`News | ${SITE.short}`); this.content.start(); }
}
@Component({ selector: 'app-gallery-page', imports: [GallerySectionComponent], template: `<app-gallery-section/>` })
export class GalleryPageComponent { constructor(t: Title) { t.setTitle(`Gallery | ${SITE.short}`); } }
@Component({ selector: 'app-initiatives-page', imports: [ServicesSectionComponent], template: `<app-services-section/>` })
export class InitiativesPageComponent { constructor(t: Title) { t.setTitle(`Initiatives | ${SITE.short}`); } }
@Component({ selector: 'app-aghorvani-page', imports: [AghorvaniFullComponent], template: `<app-aghorvani-full/>` })
export class AghorvaniPageComponent { constructor(t: Title) { t.setTitle(`Aghorvani | ${SITE.short}`); } }

@Component({
  selector: 'app-stub',
  imports: [RouterLink],
  template: `<section class="section"><div class="container" style="text-align:center;max-width:680px">
    <h1>{{ title }}</h1><div class="orn" aria-hidden="true"><i></i></div><p>{{ body }}</p>
    @if (kind === 'contact') { <p><a [href]="site.phoneHref">{{ site.phone }}</a><br><a [href]="'mailto:' + site.email">{{ site.email }}</a></p> }
    <a class="btn btn-maroon" routerLink="/">← Back to Home</a></div></section>`,
})
export class StubComponent {
  title: string; kind: string; site = SITE;
  body = 'This page is coming soon. Its content will be added in the next phase.';
  constructor(r: ActivatedRoute, t: Title) {
    this.title = r.snapshot.data['title']; this.kind = r.snapshot.data['kind'];
    if (this.kind === 'donation') this.body = 'Our verified donation details have not been added yet. Please contact the Trust using the details below or check back soon.';
    if (this.kind === 'contact') this.body = 'You can reach the Trust at:';
    if (this.kind === 'donation') this.kind = 'contact';
    t.setTitle(`${this.title} | ${SITE.short}`);
  }
}

@Component({
  selector: 'app-detail',
  imports: [RouterLink],
  template: `<section class="section"><div class="container" style="max-width:760px">
    @if (item(); as it) {
      @if (it.category) { <span class="tag">{{ it.category }}</span> }
      <h1>{{ it.title }}</h1><div class="orn" aria-hidden="true"><i></i></div>
      @if (it.date) { <p class="meta">{{ it.date }}</p> }
      @if (it.image) { <img class="cover" [src]="it.image" [alt]="it.title"> }
      @if (it.body) { @for (p of paras(); track $index) { <p class="para">{{ p }}</p> } }
      @else { <p>{{ it.excerpt }}</p>
        <p class="note">Only the supplied text is shown. The full article will be added when provided.</p> }
    } @else if (loading()) { <p class="empty">Loading…</p>
    } @else { <h1>Not found</h1><p>This page does not exist.</p> }
    <p style="margin-top:2rem"><a class="btn btn-maroon" routerLink="/news">← All news</a></p></div></section>`,
  styles: ['.cover{display:block;width:100%;height:auto;max-height:480px;object-fit:cover;margin:0 0 1.5rem}.para{white-space:pre-line;font-size:1.05rem;line-height:1.85}'],
})
export class DetailComponent {
  item = signal<NewsArticle | undefined>(undefined);
  loading = signal(true);
  paras = computed(() => (this.item()?.body ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean));
  constructor(r: ActivatedRoute, private t: Title, content: SiteContentService) {
    const slug = r.snapshot.paramMap.get('slug') ?? '';
    const builtIn = NEWS.find((n) => n.slug === slug);
    if (builtIn) { this.set(builtIn); return; }
    void content.loadArticle(slug).then((a) => this.set(a));
  }
  private set(a?: NewsArticle) { this.item.set(a); this.loading.set(false); this.t.setTitle(`${a?.title ?? 'Not found'} | ${SITE.short}`); }
}
