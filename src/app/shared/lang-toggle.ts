import { Component, inject } from '@angular/core';
import { PageLangService } from '../core/page-lang';

@Component({
  selector: 'app-lang-toggle',
  template: `<div class="lt" role="group" aria-label="Language / भाषा">
    <button type="button" [class.on]="L.lang() === 'en'" [attr.aria-pressed]="L.lang() === 'en'" (click)="L.set('en')" lang="en">English</button>
    <button type="button" [class.on]="L.lang() === 'hi'" [attr.aria-pressed]="L.lang() === 'hi'" (click)="L.set('hi')" lang="hi">हिंदी</button>
  </div>`,
  styles: [`
  .lt{display:inline-flex;padding:3px;border:1px solid rgba(255,255,255,.55);border-radius:999px;background:rgba(35,22,18,.45);backdrop-filter:blur(4px)}
  button{min-width:76px;min-height:40px;padding:0 1rem;border:0;border-radius:999px;background:transparent;color:#fff;font:600 .9rem var(--sans);cursor:pointer;transition:background .15s,color .15s}
  button.on{background:var(--ivory);color:var(--maroon)}
  button:not(.on):hover{background:rgba(255,255,255,.18)}
  button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}`],
})
export class LangToggleComponent { L = inject(PageLangService); }
