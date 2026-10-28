import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent, HeaderComponent } from './core/layout';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent],
  template: `<a class="skip" href="javascript:void(0)" (click)="focusMain()">Skip to content</a>
  <app-header/><main id="main" tabindex="-1"><router-outlet/></main><app-footer/><app-chatbot/>
  @if (showTop()) { <button type="button" class="top" (click)="up()" aria-label="Back to top">↑</button> }`,
  styles: [`.top{position:fixed;right:max(1rem,env(safe-area-inset-right));bottom:calc(5.25rem + env(safe-area-inset-bottom));width:48px;height:48px;border-radius:50%;border:1px solid var(--gold);background:var(--maroon);color:var(--gold);font-size:1.3rem;cursor:pointer;z-index:40}`],
})
export class AppComponent {
  showTop = signal(false);
  @HostListener('window:scroll') onScroll() { this.showTop.set(window.scrollY > 700); }
  up() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  focusMain() { document.getElementById('main')?.focus(); }
}
