import { Component, HostListener, Input, signal } from '@angular/core';

/** Videos + photos for one section. Files that don't exist are hidden; portrait/landscape is detected from the file itself; one video plays at a time; photos open in a lightbox. */
@Component({
  selector: 'app-media-grid',
  template: `
  @if (videos.length) {
    <div class="vids">
      @for (v of videos; track v) {
        @if (!bad()[v]) {
          <figure class="vid" [class.p]="port()[v]">
            <video [src]="dir + v + '#t=0.1'" controls playsinline preload="metadata" [attr.aria-label]="label"
                   (loadedmetadata)="meta($event, v)" (play)="onPlay($event)" (error)="miss(v)"></video>
          </figure>
        }
      }
    </div>
  }
  @if (photos.length) {
    <div class="mason">
      @for (p of photos; track p) {
        @if (!bad()[p]) {
          <button type="button" class="ph" (click)="open(p)" aria-label="Open photo"><img [src]="dir + p" [alt]="label" loading="lazy" (error)="miss(p)"></button>
        }
      }
    </div>
  }
  @if (nothing()) { <div class="empty">{{ empty }}</div> }

  @if (cur(); as c) {
    <div class="lb" role="dialog" aria-modal="true" aria-label="Photo" (click)="close()">
      <img [src]="dir + c" [alt]="label" (click)="$event.stopPropagation()">
      @if (visible().length > 1) {
        <button type="button" class="nav prev" (click)="step(-1); $event.stopPropagation()" aria-label="Previous photo">‹</button>
        <button type="button" class="nav next" (click)="step(1); $event.stopPropagation()" aria-label="Next photo">›</button>
      }
      <button type="button" class="lbx" (click)="close()" aria-label="Close">✕</button>
    </div>
  }`,
  styles: [`
  :host{display:block}
  .vids{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:1rem;align-items:start}
  .vids + .mason{margin-top:1rem}
  .vid{margin:0;aspect-ratio:16/9;background:#14100e;overflow:hidden;box-shadow:0 10px 28px rgba(53,36,31,.22)}
  .vid.p{justify-self:center;width:min(100%,240px);aspect-ratio:9/16}
  video{display:block;width:100%;height:100%;object-fit:contain;background:#14100e}
  .mason{column-width:200px;column-gap:.75rem}
  .ph{display:block;width:100%;margin:0 0 .75rem;padding:0;border:0;background:var(--brown);break-inside:avoid;overflow:hidden;cursor:zoom-in}
  .ph img{display:block;width:100%;height:auto;transition:transform .5s ease}
  .ph:hover img,.ph:focus-visible img{transform:scale(1.04)}
  .lb{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:1rem;background:rgba(20,12,9,.94);cursor:zoom-out}
  .lb>img{max-width:100%;max-height:100%;object-fit:contain;cursor:default}
  .lbx,.nav{position:absolute;display:grid;place-items:center;border:0;border-radius:50%;background:var(--ivory);color:var(--maroon);cursor:pointer}
  .lbx{top:max(.75rem,env(safe-area-inset-top));right:.75rem;width:44px;height:44px;font-size:1.2rem}
  .nav{top:50%;width:48px;height:48px;margin-top:-24px;font-size:2rem;line-height:1;padding-bottom:4px}
  .prev{left:.75rem}.next{right:.75rem}`],
})
export class MediaGridComponent {
  @Input() dir = '';
  @Input() videos: string[] = [];
  @Input() photos: string[] = [];
  @Input() label = '';
  @Input() empty = '';
  bad = signal<Record<string, boolean>>({});
  port = signal<Record<string, boolean>>({});
  cur = signal('');

  miss(f: string) { this.bad.update((b) => ({ ...b, [f]: true })); }
  nothing() { return this.empty !== '' && [...this.videos, ...this.photos].every((f) => this.bad()[f]); }
  visible() { return this.photos.filter((p) => !this.bad()[p]); }
  meta(e: Event, f: string) { const v = e.target as HTMLVideoElement; if (v.videoHeight > v.videoWidth) this.port.update((x) => ({ ...x, [f]: true })); }
  onPlay(e: Event) { document.querySelectorAll('video').forEach((v) => { if (v !== e.target) v.pause(); }); }
  open(p: string) { this.cur.set(p); }
  close() { this.cur.set(''); }
  step(d: number) { const l = this.visible(), i = l.indexOf(this.cur()); if (i >= 0) this.cur.set(l[(i + d + l.length) % l.length]); }
  @HostListener('document:keydown', ['$event']) key(e: KeyboardEvent) {
    if (!this.cur()) return;
    if (e.key === 'Escape') this.close(); else if (e.key === 'ArrowRight') this.step(1); else if (e.key === 'ArrowLeft') this.step(-1);
  }
}
