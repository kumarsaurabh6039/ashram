import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bi } from '../core/models';
import { PageLangService, UI } from '../core/page-lang';
import { MediaGridComponent } from './media-grid';

const DIR = 'assets/hospital/';
const TARGET = 1600;

interface Block { n: string; title: Bi; text: Bi; chips: Bi[]; photos: string[] }

/** Photo names follow the "N of 9" numbering of the camp album: camp-01.jpg ... camp-09.jpg (06 and 07 are the two videos). */
const BLOCKS: Block[] = [
  { n: '01', title: { en: 'Registration & Waiting Area', hi: 'पंजीकरण और प्रतीक्षा' },
    text: { en: 'People came in very large numbers. Patients were registered at the desk and then waited for their turn in line, in the shade of the trees.',
            hi: 'बहुत बड़ी संख्या में लोग पहुँचे। मरीज़ों का पंजीकरण डेस्क पर हुआ और फिर वे पेड़ों की छाँव में कतार में अपनी बारी की प्रतीक्षा करते रहे।' },
    chips: [{ en: 'Registration desk', hi: 'पंजीकरण डेस्क' }, { en: 'Ambulance on site', hi: 'एम्बुलेंस मौजूद' }],
    photos: ['camp-01.jpg', 'camp-09.jpg'] },
  { n: '02', title: { en: 'Check-up & Consultation', hi: 'जाँच और परामर्श' },
    text: { en: 'Doctors and health workers sat at the camp tables, noting down each patient\u2019s details and checking vitals such as blood pressure, so that every person could be advised properly.',
            hi: 'डॉक्टर और स्वास्थ्यकर्मी शिविर की मेज़ों पर बैठकर हर मरीज़ का विवरण दर्ज करते और रक्तचाप जैसी जाँच करते रहे, ताकि हर व्यक्ति को सही सलाह मिल सके।' },
    chips: [{ en: 'Doctors & health staff', hi: 'डॉक्टर और स्वास्थ्यकर्मी' }, { en: 'Blood pressure check', hi: 'रक्तचाप जाँच' }],
    photos: ['camp-02.jpg', 'camp-03.jpg', 'camp-08.jpg'] },
  { n: '03', title: { en: 'The Guru Purnima Gathering', hi: 'गुरु पूर्णिमा का आयोजन' },
    text: { en: 'Beneath a large decorated tent, a great number of devotees sat together for the Guru Purnima programme, the occasion around which the health camp was held.',
            hi: 'सजे हुए विशाल पंडाल के नीचे बड़ी संख्या में श्रद्धालु गुरु पूर्णिमा के कार्यक्रम में एक साथ बैठे। इसी अवसर पर स्वास्थ्य शिविर भी लगाया गया।' },
    chips: [{ en: 'Guru Purnima', hi: 'गुरु पूर्णिमा' }, { en: 'Devotees together', hi: 'श्रद्धालुओं का संगम' }],
    photos: ['camp-04.jpg', 'camp-05.jpg'] },
];
const VIDEOS = ['camp-06.mp4', 'camp-07.mp4'];

const T = {
  stat: { en: 'people treated at this year\u2019s Guru Purnima health camp', hi: 'इस वर्ष के गुरु पूर्णिमा स्वास्थ्य शिविर में उपचार पाने वाले लोग' },
  motto: { en: 'Sarv Jan Hitaay \u00b7 Sarv Jan Sukhaay', hi: 'सर्वजन हिताय \u00b7 सर्वजन सुखाय' },
  mottoSub: { en: 'For the welfare and happiness of all, the guiding spirit of the Trust.', hi: 'सबके कल्याण और सबके सुख के लिए, यही ट्रस्ट की मूल भावना है।' },
  campH: { en: 'Guru Purnima Health Camp', hi: 'गुरु पूर्णिमा स्वास्थ्य शिविर' },
  campSub: { en: 'Alongside the Guru Purnima gathering, our hospital team held a health camp, and more than 1,600 people received treatment. Here is a look at the camp.', hi: 'गुरु पूर्णिमा के आयोजन के साथ हमारी अस्पताल टीम ने स्वास्थ्य शिविर लगाया, जिसमें 1,600 से अधिक लोगों का उपचार हुआ। आइए, शिविर की झलक देखें।' },
  vidH: { en: 'The Camp in Videos', hi: 'वीडियो में शिविर' },
  ctaH: { en: 'Help us hold more camps like this', hi: 'ऐसे और शिविर लगाने में हमारी मदद करें' },
  ctaP: { en: 'Every contribution helps the hospital reach more people who need care.', hi: 'आपका हर योगदान अस्पताल को ज़्यादा से ज़्यादा ज़रूरतमंद लोगों तक पहुँचाने में मदद करता है।' },
  ctaBtn: { en: '♥ Support Our Hospital', hi: '♥ हमारे अस्पताल को सहयोग दें' },
} satisfies Record<string, Bi>;

@Component({
  selector: 'app-hospital-story',
  imports: [RouterLink, MediaGridComponent],
  template: `
  <!-- Big number -->
  <section class="stat" aria-label="Health camp">
    <div class="container" [attr.lang]="L.lang()">
      <p class="big" #big><span aria-hidden="true">{{ shown() }}+</span><span class="sr">1,600+</span></p>
      <p class="lbl">{{ L.p(T.stat) }}</p>
      <div class="motto"><strong>{{ L.p(T.motto) }}</strong><span>{{ L.p(T.mottoSub) }}</span></div>
    </div>
  </section>

  <section class="section alt" aria-labelledby="hc-h">
    <div class="container">
      <div class="sec-head" [attr.lang]="L.lang()">
        <h2 id="hc-h">{{ L.p(T.campH) }}</h2><div class="orn" aria-hidden="true"><i></i></div>
        <p>{{ L.p(T.campSub) }}</p>
      </div>
      <div class="st-steps">
        @for (b of blocks; track b.n) {
          <article class="st-step">
            <div class="st-txt" [attr.lang]="L.lang()">
              <span class="st-num" aria-hidden="true">{{ b.n }}</span>
              <h3>{{ L.p(b.title) }}</h3>
              <p>{{ L.p(b.text) }}</p>
              <ul class="st-chips">@for (c of b.chips; track c.en) { <li>{{ L.p(c) }}</li> }</ul>
            </div>
            <app-media-grid [dir]="dir" [photos]="b.photos" [label]="L.p(b.title)" [empty]="L.p(ui.photosSoon)"/>
          </article>
        }
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="hv-h">
    <div class="container">
      <div class="sec-head"><h2 id="hv-h" [attr.lang]="L.lang()">{{ L.p(T.vidH) }}</h2><div class="orn" aria-hidden="true"><i></i></div></div>
      <app-media-grid [dir]="dir" [videos]="videos" [label]="L.p(T.vidH)" [empty]="L.p(ui.videosSoon)"/>
    </div>
  </section>

  <section class="cta">
    <div class="container" [attr.lang]="L.lang()">
      <h2>{{ L.p(T.ctaH) }}</h2>
      <p>{{ L.p(T.ctaP) }}</p>
      <a class="btn btn-gold" routerLink="/donation">{{ L.p(T.ctaBtn) }}</a>
    </div>
  </section>`,
  styles: [`
  :host{display:block}
  .stat{padding:clamp(2.5rem,6vw,4.5rem) 0;background:linear-gradient(160deg,var(--maroon),var(--brown));color:var(--ivory);text-align:center}
  .big{margin:0;font:600 clamp(4.5rem,15vw,9rem)/1 var(--serif);color:var(--gold);letter-spacing:.01em}
  .lbl{margin:.6rem auto 0;max-width:640px;font-size:clamp(1.1rem,2.4vw,1.4rem);color:#fff}
  .motto{display:flex;flex-direction:column;gap:.25rem;max-width:560px;margin:1.75rem auto 0;padding-top:1.5rem;border-top:1px solid rgba(178,138,75,.55)}
  .motto strong{font:600 clamp(1.3rem,3vw,1.7rem) var(--serif);color:var(--gold)}
  .motto span{font-size:.95rem;color:var(--sand)}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .cta{padding:clamp(2.5rem,6vw,4rem) 0;background:var(--sand);text-align:center}
  .cta h2{margin-bottom:.4rem}.cta p{margin:0 auto 1.25rem;max-width:560px}`],
})
export class HospitalStoryComponent implements AfterViewInit {
  L = inject(PageLangService);
  T = T; ui = UI; dir = DIR; blocks = BLOCKS; videos = VIDEOS;
  n = signal(0);
  @ViewChild('big') big!: ElementRef<HTMLElement>;
  shown = () => this.n().toLocaleString('en-IN');

  /** Counts up to 1,600 once, when the number scrolls into view (no animation if the visitor prefers reduced motion). */
  ngAfterViewInit() {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
    if (still) { this.n.set(TARGET); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); this.run(); } }, { threshold: 0.4 });
    io.observe(this.big.nativeElement);
  }
  private run() {
    const t0 = performance.now(), D = 1400;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / D);
      this.n.set(Math.round(TARGET * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
