import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MORE, NAV } from './content';
import { SITE } from './site.config';
import { AdminService } from '../chatbot/admin.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
  <div class="strip" role="marquee" aria-label="ॐ तत् सत्">
    <div class="track" aria-hidden="true" lang="hi">
      @for (i of reps; track i) { <span>ॐ तत् सत्</span> }
      @for (i of reps; track i) { <span>ॐ तत् सत्</span> }
    </div>
  </div>
  <header class="hdr">
    <div class="container bar">
      <a routerLink="/" class="brand" [attr.aria-label]="site.name + ', home'" (click)="close()">
        <img class="emblem-img" src="assets/logo.png" alt="Aghor Peeth Janseva Abhed Ashram Trust logo" width="84" height="84">
        <span><strong>{{ site.short }}</strong><small>{{ site.ashram }} Trust</small></span>
      </a>
      <button type="button" class="burger" (click)="open.set(!open()); more.set(false)" [attr.aria-expanded]="open()" aria-controls="mainnav" aria-label="Toggle menu">
        <span></span><span></span><span></span></button>
      <nav id="mainnav" [class.open]="open()" aria-label="Main">
        @for (l of nav; track l.label) {
          <a [routerLink]="l.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !!l.exact }" (click)="close()">{{ l.label }}</a>
        }
        <div class="dd">
          <button type="button" (click)="more.set(!more())" [attr.aria-expanded]="more()" aria-haspopup="true">More ▾</button>
          @if (more()) { <div class="menu">
            @for (m of extra; track m.label) { <a [routerLink]="m.path" routerLinkActive="active" (click)="close()">{{ m.label }}</a> }
            <a routerLink="/admin" class="lg-link" routerLinkActive="active" (click)="close()">{{ ad.loggedIn() ? 'Admin Dashboard' : 'Login' }}</a></div> }
        </div>
        <a routerLink="/donation" class="btn btn-gold don" (click)="close()">♥ Donation</a>
      </nav>
    </div>
  </header>`,
  styles: [`
  .strip{background:var(--maroon);color:var(--gold);overflow:hidden;white-space:nowrap;font-size:.95rem;letter-spacing:.1em;padding:.35rem 0}
  .track{display:inline-flex;width:max-content;animation:scroll 30s linear infinite}
  .track span{padding:0 2.5rem}
  @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .hdr{position:sticky;top:0;z-index:50;background:var(--ivory);border-bottom:1px solid var(--gold);height:var(--header-h)}
  .bar{display:flex;align-items:center;justify-content:space-between;height:100%;gap:1rem}
  .brand{display:flex;align-items:center;gap:.9rem;text-decoration:none;color:var(--maroon)}
  .brand strong{display:block;font:700 1.75rem/1.1 var(--serif)}.brand small{font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text)}
  .emblem-img{width:84px;height:84px;object-fit:contain;border-radius:50%;flex:none;animation:spin 14s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .emblem{width:44px;height:44px;border-radius:50%;background:var(--maroon);color:var(--gold);display:grid;place-items:center;font-size:1.5rem;border:2px solid var(--gold)}
  nav{display:flex;align-items:center;gap:1rem}
  nav>a:not(.btn),.dd>button{text-decoration:none;color:var(--brown);font:500 .92rem var(--sans);padding:.4rem 0;border:0;border-bottom:2px solid transparent;background:none;cursor:pointer}
  nav>a:not(.btn):hover,.dd>button:hover,nav a.active{border-bottom-color:var(--gold);color:var(--maroon)}
  nav a.active{font-weight:600}
  .don{min-height:40px;padding:.4rem 1.1rem;font-size:.9rem;font-weight:600}
  .dd{position:relative}.menu{position:absolute;top:100%;right:0;min-width:200px;background:var(--ivory);border:1px solid var(--gold);box-shadow:0 10px 24px rgba(53,36,31,.15);display:grid;z-index:60}
  .menu a{padding:.75rem 1rem;color:var(--brown);text-decoration:none;font-size:.92rem}.menu a:hover,.menu a.active{background:var(--sand)}
  .burger{display:none;width:46px;height:46px;border:1px solid var(--gold);background:transparent;cursor:pointer;flex-direction:column;gap:5px;align-items:center;justify-content:center}
  .burger span{width:22px;height:2px;background:var(--maroon)}
  @media(max-width:1100px){
    .burger{display:flex}
    .emblem-img{width:66px;height:66px}
    .brand strong{font-size:1.3rem}.brand small{font-size:.68rem}
    nav{position:absolute;top:var(--header-h);left:0;right:0;background:var(--ivory);flex-direction:column;align-items:stretch;gap:0;padding:.5rem 1.25rem 1.5rem;border-bottom:1px solid var(--gold);display:none;max-height:calc(100vh - var(--header-h));overflow:auto}
    nav.open{display:flex}
    nav>a:not(.btn),.dd>button{display:block;width:100%;text-align:left;padding:.9rem 0;border-bottom:1px solid var(--sand)}
    .menu{position:static;box-shadow:none;border:0;border-left:2px solid var(--gold);margin-left:.5rem}
    .don{margin-top:1rem}
  }
  @media(max-width:420px){.brand{gap:.6rem}.emblem-img{width:56px;height:56px}.brand strong{font-size:1.1rem}.brand small{font-size:.62rem;letter-spacing:.08em}.bar{gap:.5rem}}`],
})
export class HeaderComponent {
  ad = inject(AdminService);
  site = SITE; nav = NAV; extra = MORE; reps = Array.from({ length: 8 }, (_, i) => i);
  open = signal(false); more = signal(false);
  private el = inject(ElementRef);
  close() { this.open.set(false); this.more.set(false); }
  @HostListener('document:keydown.escape') esc() { this.close(); }
  @HostListener('document:click', ['$event']) out(e: Event) { if (!this.el.nativeElement.contains(e.target)) this.more.set(false); }
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
  <footer>
    <div class="container top">
      <div class="stage" aria-hidden="false">
        <div class="figure">
          <img class="baba" src="assets/babaji.png" alt="Babaji with his hand raised in blessing" width="440" height="475" loading="lazy">
          <img class="aura" src="assets/aura.png" alt="" aria-hidden="true" width="426" height="416" loading="lazy">
        </div>
      </div>
      <div class="info">
        <p class="eyebrow">SEVA • SADHANA • HUMAN WELFARE</p>
        <h2>{{ site.name }}</h2>
        <div class="orn" style="justify-content:flex-start" aria-hidden="true"><i></i></div>
        <p class="lead">Rooted in spiritual awareness, compassion and humanity, committed to a life of simplicity, harmony and selfless service to society.</p>
        <ul class="contact">
          <li><span>Phone</span><a [href]="site.phoneHref">{{ site.phone }}</a></li>
          <li><span>Email</span><a [href]="'mailto:' + site.email">{{ site.email }}</a></li>
        </ul>
        <div class="links">
          <nav aria-label="Footer information"><h3>Information</h3>
            <a routerLink="/">Home</a><a routerLink="/about">About</a><a routerLink="/gallery">Gallery</a><a routerLink="/donation">Donation</a>
            <a routerLink="/contact">Contact</a><a routerLink="/organic-farming">Organic Farming</a></nav>
          <nav aria-label="Footer other"><h3>Other</h3>
            <a routerLink="/news">News</a><a routerLink="/hospital">Hospital</a><a routerLink="/aghorvani">Aghorvani</a>
            <a routerLink="/initiatives">Initiatives</a><a routerLink="/school">School</a></nav>
        </div>
      </div>
    </div>
    <div class="copy"><div class="container"><span>© {{ year }} {{ site.name }}. All rights reserved.</span><span lang="hi" class="om">ॐ तत् सत्</span></div></div>
  </footer>`,
  styles: [`
  footer{position:relative;overflow:hidden;color:var(--sand);border-top:3px solid var(--gold);
    background:radial-gradient(circle at 16% 75%,rgba(178,138,75,.28),transparent 45%),radial-gradient(circle at 85% 10%,rgba(84,43,36,.7),transparent 50%),linear-gradient(180deg,#3d2822,#241713)}
  .top{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:clamp(2rem,6vw,5rem);align-items:end}
  .stage{align-self:end;padding-left:3rem}
  .figure{position:relative;width:100%}
  .baba{display:block;width:100%;height:auto;position:relative;z-index:1;filter:drop-shadow(0 12px 28px rgba(0,0,0,.45))}
  .aura{position:absolute;z-index:2;left:21%;top:50%;width:70%;height:auto;pointer-events:none;mix-blend-mode:screen;opacity:.9;
    transform:translate(-50%,-50%);animation:aura 26s linear infinite}
  @keyframes aura{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
  .info{padding:clamp(3rem,6vw,4.5rem) 0 clamp(2rem,4vw,3rem)}
  .eyebrow{color:var(--gold);letter-spacing:.22em;font-size:.75rem;font-weight:600;margin:0 0 .6rem}
  h2{color:var(--ivory);font-size:clamp(1.8rem,3.4vw,2.7rem);margin:0}
  .lead{max-width:520px;margin:.2rem 0 1.5rem}
  .contact{list-style:none;margin:0 0 2rem;padding:0;display:grid;gap:.5rem}
  .contact li{display:flex;gap:1rem;align-items:baseline;border-left:2px solid var(--gold);padding-left:.9rem}
  .contact span{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);min-width:52px}
  .contact a{color:var(--ivory);text-decoration:none;font-size:1.05rem}.contact a:hover{color:var(--gold)}
  .links{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1.5rem;border-top:1px solid rgba(178,138,75,.45);padding-top:1.6rem}
  h3{color:var(--ivory);font-size:1.15rem;margin:0 0 .5rem}
  nav{display:grid;align-content:start}nav a{color:var(--sand);text-decoration:none;padding:.3rem 0}nav a:hover{color:var(--gold);padding-left:.25rem}nav a{transition:padding .2s,color .2s}
  .copy{position:relative;z-index:3;background:rgba(0,0,0,.35);border-top:1px solid rgba(178,138,75,.6);font-size:.85rem}
  .copy .container{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1rem 0}.om{color:var(--gold);letter-spacing:.12em}
  @media(max-width:860px){.top{grid-template-columns:1fr;gap:0}.stage{order:2;padding-left:0;width:min(78%,340px);margin:0 auto;padding-top:1rem}.info{padding-bottom:1rem}.aura{width:78%}}`],
})
export class FooterComponent { site = SITE; year = new Date().getFullYear(); }