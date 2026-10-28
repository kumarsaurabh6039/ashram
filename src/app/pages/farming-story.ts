import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bi } from '../core/models';
import { PageLangService, UI } from '../core/page-lang';
import { MediaGridComponent } from './media-grid';

interface Step { n: string; title: Bi; text: Bi; chips: Bi[]; videos: string[] }

const DIR = 'assets/farming/';

/** To add another clip, put the file in src/assets/farming/ and add its name to `videos`. Missing files simply don't show. */
const STEPS: Step[] = [
  { n: '01', title: { en: 'Nursery', hi: 'पौध की तैयारी' },
    text: { en: 'Our seedlings are not sown straight into the field. They are first grown as a thick, even green mat in shallow trays. Healthy, uniform seedlings give the whole crop a strong start.',
            hi: 'हमारी पौध सीधे खेत में नहीं बोई जाती। पहले उसे उथली ट्रे में घनी और एक समान हरी चटाई (मैट) की तरह उगाया जाता है। स्वस्थ और एक जैसी पौध पूरी फसल को मज़बूत शुरुआत देती है।' },
    chips: [{ en: 'Even seedlings', hi: 'एक समान पौध' }, { en: 'Strong start', hi: 'मज़बूत शुरुआत' }],
    videos: ['nursery-1.mp4', 'nursery-2.mp4', 'nursery-3.mp4', 'nursery-4.mp4'] },
  { n: '02', title: { en: 'Machine Transplanting', hi: 'मशीन से रोपाई' },
    text: { en: 'The field is flooded and worked into soft mud. A rice transplanter then lifts the seedlings from the tray mat and plants them in neat, evenly spaced rows, saving time and heavy manual labour.',
            hi: 'खेत में पानी भरकर उसे नरम कीचड़ जैसा तैयार किया जाता है। फिर धान रोपाई मशीन ट्रे की चटाई से पौध उठाकर उसे सीधी, बराबर दूरी वाली कतारों में लगाती है। इससे समय बचता है और हाथ की भारी मेहनत कम होती है।' },
    chips: [{ en: 'Even rows', hi: 'सीधी कतारें' }, { en: 'Less hard labour', hi: 'कम मेहनत' }, { en: 'Saves time', hi: 'समय की बचत' }],
    videos: ['transplanter-1.mp4', 'transplanter-2.mp4'] },
  { n: '03', title: { en: 'Growing Crop', hi: 'फसल की बढ़वार' },
    text: { en: 'Planted in even rows, the crop gets its share of light and air and is easy to look after. This is how the green fields on our land take shape, season after season.',
            hi: 'सीधी कतारों में लगी फसल को रोशनी और हवा बराबर मिलती है और उसकी देखभाल करना आसान होता है। इसी तरह हमारी ज़मीन पर हर मौसम में हरे-भरे खेत तैयार होते हैं।' },
    chips: [{ en: 'Light & air for every plant', hi: 'हर पौधे को रोशनी और हवा' }, { en: 'Easy to tend', hi: 'देखभाल आसान' }],
    videos: ['crop-1.mp4', 'crop-2.mp4', 'crop-3.mp4'] },
  { n: '04', title: { en: 'Drone Spraying', hi: 'ड्रोन से छिड़काव' },
    text: { en: 'Agricultural drones fly over the field and spray evenly across it. Large areas are covered quickly, and nobody has to walk through the standing crop.',
            hi: 'खेती वाले ड्रोन खेत के ऊपर उड़कर पूरे खेत में समान रूप से छिड़काव करते हैं। बड़ा क्षेत्र जल्दी कवर हो जाता है और खड़ी फसल में किसी को पैदल चलना नहीं पड़ता।' },
    chips: [{ en: 'Even coverage', hi: 'समान छिड़काव' }, { en: 'Fast', hi: 'तेज़ काम' }, { en: 'No walking through the crop', hi: 'फसल में पैदल चलने की ज़रूरत नहीं' }],
    videos: ['drone-1.mp4', 'drone-2.mp4', 'drone-3.mp4'] },
];
const PHOTOS = Array.from({ length: 8 }, (_, i) => `photo-0${i + 1}.jpg`);

const T = {
  stepsH: { en: 'From Seed to Harvest', hi: 'बीज से फसल तक' },
  stepsSub: { en: 'How our farming works, step by step, with the technology we use.', hi: 'हमारी खेती कैसे होती है, चरण-दर-चरण, और हम कौन-सी तकनीक इस्तेमाल करते हैं।' },
  techH: { en: 'Why We Use Technology', hi: 'हम तकनीक का उपयोग क्यों करते हैं' },
  techSub: { en: 'Old values, new tools. Farming stays seva, and the work gets lighter.', hi: 'पुराने मूल्य, नए साधन। खेती सेवा ही रहती है, बस काम हल्का हो जाता है।' },
  t1: { en: 'Saves Time', hi: 'समय की बचत' }, t1p: { en: 'Machines and drones cover large areas far faster than work done by hand.', hi: 'मशीनें और ड्रोन बड़े क्षेत्र को हाथ के काम से कहीं तेज़ी से पूरा करते हैं।' },
  t2: { en: 'Eases Hard Labour', hi: 'कठिन परिश्रम में राहत' }, t2p: { en: 'Planting and spraying are among the most tiring jobs in the field. Technology takes the strain off people.', hi: 'रोपाई और छिड़काव खेत के सबसे थकाने वाले कामों में हैं। तकनीक लोगों का बोझ हल्का करती है।' },
  t3: { en: 'Even & Precise', hi: 'समान और सटीक' }, t3p: { en: 'Evenly spaced rows and uniform spraying give every plant its fair share of space and care.', hi: 'बराबर दूरी की कतारें और समान छिड़काव हर पौधे को उसके हिस्से की जगह और देखभाल देते हैं।' },
  gTag: { en: 'Gaushala', hi: 'गौशाला' }, gH: { en: 'Gaushala, Beside Our Fields', hi: 'हमारे खेतों के पास गौशाला' },
  g1: { en: 'Our organization has established a Gaushala to support its organic farming initiatives.', hi: 'हमारी संस्था ने जैविक खेती की पहल को सहारा देने के लिए एक गौशाला की स्थापना की है।' },
  g2: { en: 'Caring for cows is an act of seva. Standing beside the fields, the Gaushala reflects our belief that good farming begins with care for every living being.', hi: 'गौ-सेवा एक पुण्य कार्य है। खेतों के पास खड़ी यह गौशाला हमारी इस मान्यता को दर्शाती है कि अच्छी खेती हर जीव की देखभाल से शुरू होती है।' },
  gBtn: { en: '♥ Support Gaushala & Farming', hi: '♥ गौशाला और खेती को सहयोग दें' },
  photosH: { en: 'Glimpses from Our Fields', hi: 'हमारे खेतों की झलक' },
} satisfies Record<string, Bi>;

@Component({
  selector: 'app-farming-story',
  imports: [RouterLink, MediaGridComponent],
  template: `
  <section class="section alt" aria-labelledby="fs-h">
    <div class="container">
      <div class="sec-head">
        <h2 id="fs-h" [attr.lang]="L.lang()">{{ L.p(T.stepsH) }}</h2><div class="orn" aria-hidden="true"><i></i></div>
        <p [attr.lang]="L.lang()">{{ L.p(T.stepsSub) }}</p>
      </div>
      <div class="st-steps">
        @for (s of steps; track s.n) {
          <article class="st-step">
            <div class="st-txt" [attr.lang]="L.lang()">
              <span class="st-num" aria-hidden="true">{{ s.n }}</span>
              <h3>{{ L.p(s.title) }}</h3>
              <p>{{ L.p(s.text) }}</p>
              <ul class="st-chips">@for (c of s.chips; track c.en) { <li>{{ L.p(c) }}</li> }</ul>
            </div>
            <app-media-grid [dir]="dir" [videos]="s.videos" [label]="L.p(s.title)" [empty]="L.p(ui.videosSoon)"/>
          </article>
        }
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="ft-h">
    <div class="container" [attr.lang]="L.lang()">
      <div class="sec-head">
        <h2 id="ft-h">{{ L.p(T.techH) }}</h2><div class="orn" aria-hidden="true"><i></i></div>
        <p>{{ L.p(T.techSub) }}</p>
      </div>
      <div class="tech">
        <div class="tc"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <h3>{{ L.p(T.t1) }}</h3><p>{{ L.p(T.t1p) }}</p></div>
        <div class="tc"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V9M12 9c0-3 2-5 6-5 0 4-2 6-6 5zM12 13c0-2.5-1.8-4-5-4 0 3.5 1.8 5 5 4z"/></svg>
          <h3>{{ L.p(T.t2) }}</h3><p>{{ L.p(T.t2p) }}</p></div>
        <div class="tc"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          <h3>{{ L.p(T.t3) }}</h3><p>{{ L.p(T.t3p) }}</p></div>
      </div>
    </div>
  </section>

  <section class="gau" aria-labelledby="fg-h">
    <div class="container gau-in">
      <div class="gau-fr">
        <img src="assets/gausala.png" alt="Gaushala" loading="lazy" [hidden]="gauBad()" (error)="gauBad.set(true)">
        @if (gauBad()) { <span class="gau-ph" aria-hidden="true">ॐ</span> }
      </div>
      <div class="gau-tx" [attr.lang]="L.lang()">
        <span class="tag">{{ L.p(T.gTag) }}</span>
        <h2 id="fg-h">{{ L.p(T.gH) }}</h2>
        <p>{{ L.p(T.g1) }}</p>
        <p>{{ L.p(T.g2) }}</p>
        <a class="btn btn-gold" routerLink="/donation">{{ L.p(T.gBtn) }}</a>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="fp-h">
    <div class="container">
      <div class="sec-head"><h2 id="fp-h" [attr.lang]="L.lang()">{{ L.p(T.photosH) }}</h2><div class="orn" aria-hidden="true"><i></i></div></div>
      <app-media-grid [dir]="dir" [photos]="photos" [label]="L.p(T.photosH)" [empty]="L.p(ui.photosSoon)"/>
    </div>
  </section>`,
  styles: [`
  :host{display:block}
  .tech{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:1.5rem}
  .tc{padding:1.75rem 1.5rem;background:#fff;border:1px solid var(--sand);border-top:3px solid var(--gold);text-align:center}
  .tc svg{color:var(--gold)}.tc h3{margin:.6rem 0 .3rem;font-size:1.5rem}.tc p{margin:0}
  .gau{background:linear-gradient(160deg,var(--maroon),var(--brown));color:var(--ivory);padding:clamp(3rem,7vw,5.5rem) 0}
  .gau-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1.75rem,5vw,4rem);align-items:center}
  .gau-fr{position:relative;aspect-ratio:4/3;overflow:hidden;background:rgba(0,0,0,.25);border:1px solid var(--gold);box-shadow:14px 14px 0 rgba(178,138,75,.25);display:grid;place-items:center}
  .gau-fr img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .gau-ph{font:600 4.5rem var(--serif-hi);color:var(--gold);opacity:.7}
  .gau-tx .tag{display:inline-block;background:var(--gold);color:var(--brown)}
  .gau-tx h2{color:#fff;font-size:clamp(2rem,4vw,2.8rem);margin:.6rem 0 .8rem}
  .gau-tx p{color:var(--sand);margin:0 0 1rem;font-size:1.05rem}
  .gau-tx .btn{margin-top:.5rem}
  @media(max-width:900px){.gau-in{grid-template-columns:1fr}.gau-fr{box-shadow:8px 8px 0 rgba(178,138,75,.25);margin-right:8px}}`],
})
export class FarmingStoryComponent {
  L = inject(PageLangService);
  T = T; ui = UI; dir = DIR; steps = STEPS; photos = PHOTOS;
  gauBad = signal(false);
}
