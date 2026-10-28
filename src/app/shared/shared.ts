import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  template: `<div class="sec-head"><h2 [attr.lang]="hi ? 'hi' : null">{{ title }}</h2>
    <div class="orn" aria-hidden="true"><i></i></div>
    @if (subtitle) { <p [attr.lang]="subHi ? 'hi' : null">{{ subtitle }}</p> }</div>`,
})
export class SectionHeadingComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() hi = false;
  @Input() subHi = false;
}

/** Image if provided, otherwise a clearly temporary, brand-coloured placeholder (never a fake photo). */
@Component({
  selector: 'app-media',
  template: `@if (src()) { <img [src]="src()" [alt]="alt()" loading="lazy" style="width:100%;height:100%;object-fit:cover"> }
    @else { <div class="art cover" role="img" [attr.aria-label]="'Placeholder: ' + alt()">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M8 58V30a24 24 0 0 1 48 0v28M18 58V32a14 14 0 0 1 28 0v26M4 58h56M32 6V2"/></svg></div> }`,
  styles: [':host{display:block;position:relative;overflow:hidden;height:100%}'],
})
export class MediaComponent {
  src = input<string | null | undefined>(null);
  alt = input('');
}

@Component({
  selector: 'app-pagination',
  template: `<nav class="pager" aria-label="Pagination">
    <span class="info">Page {{ page }} of {{ total }}</span>
    <button type="button" (click)="go(page - 1)" [disabled]="page === 1" aria-label="Previous page">←</button>
    @for (p of pages(); track $index) {
      @if (p === 0) { <span aria-hidden="true">…</span> }
      @else { <button type="button" (click)="go(p)" [attr.aria-current]="p === page ? 'page' : null" [attr.aria-label]="'Page ' + p">{{ p }}</button> }
    }
    <button type="button" (click)="go(page + 1)" [disabled]="page === total">Next →</button></nav>`,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() total = 1;
  @Output() pageChange = new EventEmitter<number>();
  go(p: number) { if (p >= 1 && p <= this.total) this.pageChange.emit(p); }
  pages() {
    const t = this.total, c = this.page;
    if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1);
    const s = new Set([1, t, c - 1, c, c + 1].filter(n => n >= 1 && n <= t));
    const arr = [...s].sort((a, b) => a - b), out: number[] = [];
    arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) out.push(0); out.push(n); });
    return out;
  }
}

@Component({
  selector: 'app-load-more',
  template: `@if (remaining > 0) { <div style="text-align:center;margin-top:2.25rem">
    <button type="button" class="btn btn-line" (click)="more.emit()">Load More ({{ remaining }})</button></div> }`,
})
export class LoadMoreComponent {
  @Input() remaining = 0;
  @Output() more = new EventEmitter<void>();
}
