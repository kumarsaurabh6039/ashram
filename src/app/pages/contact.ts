import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { SITE } from '../core/site.config';

/** Every text is a pair: [हिन्दी, English]. Edit here, no template changes needed. */
type Bi = [hi: string, en: string];

/* ───────────── Contact details (single source for this page) ───────────── */
const ADDRESS_EN = 'Aghor Peeth Jan Seva Abhed Ashram, Village & Po-Pondi (Dalha), Block-Akaltara, District-Janjgir-Champa, Chhattisgarh, Pincode-495552';
const ADDRESS_LINES: Bi[] = [
  ['अघोर पीठ जनसेवा अभेद आश्रम', 'Aghor Peeth Jan Seva Abhed Ashram'],
  ['ग्राम व पोस्ट – पोंडी (दल्हा)', 'Village & Po – Pondi (Dalha)'],
  ['विकासखंड – अकलतरा', 'Block – Akaltara'],
  ['जिला – जांजगीर-चांपा, छत्तीसगढ़', 'District – Janjgir-Champa, Chhattisgarh'],
  ['पिनकोड – 495552', 'Pincode – 495552'],
];
const PHONE_SHOW = '+91-7000031175';
const PHONE_HREF = 'tel:+917000031175';
const EMAIL = 'aghorpeeth@gmail.com';
const MAP_QUERY = 'Podi Dalha, Akaltara, Janjgir-Champa, Chhattisgarh 495552';

/** Add social pages here and a "Follow us" row appears automatically, e.g. { name: 'YouTube', url: 'https://youtube.com/@...' } */
const SOCIALS: { name: string; url: string }[] = [];

const TOPICS: Bi[] = [
  ['सामान्य जानकारी', 'General enquiry'],
  ['विद्यालय / प्रवेश', 'School / admission'],
  ['चिकित्सालय', 'Hospital'],
  ['दान एवं सहयोग', 'Donation & support'],
  ['आश्रम दर्शन / यात्रा', 'Visiting the Ashram'],
  ['जैविक कृषि / गौशाला', 'Organic farming / Gaushala'],
];

@Component({
  selector: 'app-contact-page',
  imports: [RouterLink],
  template: `
  <!-- ═════ hero ═════ -->
  <section class="hero" aria-labelledby="ct-h">
    <span class="mark" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container hbox">
      <p class="crumb"><a routerLink="/">{{ t(['मुख पृष्ठ', 'Home']) }}</a> <span aria-hidden="true">/</span> {{ t(['संपर्क', 'Contact']) }}</p>
      <h1 id="ct-h">{{ t(['संपर्क करें', 'Contact us']) }}</h1>
      <div class="orn" style="justify-content:flex-start" aria-hidden="true"><i></i></div>
      <p class="lead">{{ t(['विद्यालय, चिकित्सालय, सहयोग या आश्रम दर्शन — किसी भी प्रश्न के लिए हमसे सीधे जुड़ें।', 'Questions about the school, the hospital, donations or a visit — reach us directly.']) }}</p>
      <div class="lang" role="group" aria-label="Choose language">
        <button type="button" [class.on]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="lang.set('en')">English</button>
        <button type="button" lang="hi" [class.on]="lang() === 'hi'" [attr.aria-pressed]="lang() === 'hi'" (click)="lang.set('hi')">हिन्दी</button>
      </div>
    </div>
  </section>

  <!-- ═════ three ways to reach us ═════ -->
  <section class="ways" aria-label="Contact details">
    <div class="container wgrid">

      <article class="way">
        <span class="ico" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>
        </span>
        <h2>{{ t(['पता', 'Address']) }}</h2>
        <address [attr.lang]="lang()">
          @for (l of addr; track $index) { <span>{{ t(l) }}</span> }
        </address>
        <div class="acts">
          <a class="btn btn-gold" [href]="dirUrl" target="_blank" rel="noopener">{{ t(['रास्ता देखें', 'Get directions']) }}</a>
          <button type="button" class="btn btn-line" (click)="copy('addr', addressEn)">{{ copied() === 'addr' ? t(['✓ कॉपी हुआ', '✓ Copied']) : t(['पता कॉपी करें', 'Copy address']) }}</button>
        </div>
      </article>

      <article class="way">
        <span class="ico" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
        </span>
        <h2>{{ t(['फ़ोन', 'Call us']) }}</h2>
        <p class="big"><a [href]="phoneHref">{{ phone }}</a></p>
        <p class="note">{{ t(['सीधे कॉल करने के लिए नीचे दबाएँ।', 'Tap below to call directly from your phone.']) }}</p>
        <div class="acts">
          <a class="btn btn-gold" [href]="phoneHref">{{ t(['अभी कॉल करें', 'Call now']) }}</a>
          <button type="button" class="btn btn-line" (click)="copy('tel', phone)">{{ copied() === 'tel' ? t(['✓ कॉपी हुआ', '✓ Copied']) : t(['नंबर कॉपी करें', 'Copy number']) }}</button>
        </div>
      </article>

      <article class="way">
        <span class="ico" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/></svg>
        </span>
        <h2>{{ t(['ईमेल', 'Email us']) }}</h2>
        <p class="big"><a [href]="'mailto:' + email">{{ email }}</a></p>
        <p class="note">{{ t(['अपना प्रश्न या सुझाव लिखकर भेजें।', 'Write to us with your question or suggestion.']) }}</p>
        <div class="acts">
          <a class="btn btn-gold" [href]="'mailto:' + email">{{ t(['ईमेल भेजें', 'Send an email']) }}</a>
          <button type="button" class="btn btn-line" (click)="copy('mail', email)">{{ copied() === 'mail' ? t(['✓ कॉपी हुआ', '✓ Copied']) : t(['ईमेल कॉपी करें', 'Copy email']) }}</button>
        </div>
      </article>

    </div>
  </section>

  <!-- ═════ message form + map ═════ -->
  <section class="main" aria-labelledby="msg-h">
    <div class="container mgrid">

      <div class="formcol">
        <h2 id="msg-h">{{ t(['हमें संदेश भेजें', 'Send us a message']) }}</h2>
        <p class="sub">{{ t(['फ़ॉर्म भरने पर आपके ईमेल ऐप में संदेश तैयार खुलेगा — बस “भेजें” दबाना है।', 'Filling the form opens your email app with the message ready — just press send.']) }}</p>

        <form #f class="form" (submit)="send($event, f)" novalidate>
          <div class="row2">
            <div class="fld">
              <label for="c-name">{{ t(['आपका नाम', 'Your name']) }} *</label>
              <input id="c-name" name="name" type="text" autocomplete="name" required [attr.aria-invalid]="errors().name ? 'true' : null" aria-describedby="e-name">
              <span id="e-name" class="err" role="alert">{{ errors().name ? t(['कृपया अपना नाम लिखें।', 'Please enter your name.']) : '' }}</span>
            </div>
            <div class="fld">
              <label for="c-phone">{{ t(['फ़ोन नंबर', 'Phone number']) }}</label>
              <input id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">
            </div>
          </div>
          <div class="fld">
            <label for="c-topic">{{ t(['विषय', 'Topic']) }}</label>
            <select id="c-topic" name="topic">
              @for (o of topics; track $index) { <option [value]="o[1]">{{ t(o) }}</option> }
            </select>
          </div>
          <div class="fld">
            <label for="c-msg">{{ t(['आपका संदेश', 'Your message']) }} *</label>
            <textarea id="c-msg" name="message" rows="5" required [attr.aria-invalid]="errors().message ? 'true' : null" aria-describedby="e-msg"></textarea>
            <span id="e-msg" class="err" role="alert">{{ errors().message ? t(['कृपया अपना संदेश लिखें।', 'Please write your message.']) : '' }}</span>
          </div>
          <button type="submit" class="btn btn-gold submit">{{ t(['संदेश भेजें', 'Send message']) }}</button>
          @if (sent()) { <p class="ok" role="status">{{ t(['आपका ईमेल ऐप खुल रहा है। न खुले तो सीधे ' + email + ' पर लिखें।', 'Opening your email app. If nothing opens, write to ' + email + ' directly.']) }}</p> }
        </form>
      </div>

      <div class="mapcol">
        <div class="map">
          <iframe [src]="mapUrl" title="Map of Aghor Peeth Janseva Abhed Ashram" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="mapcap">
          <strong>{{ t(['आश्रम तक पहुँचने के लिए', 'Finding the Ashram']) }}</strong>
          <span>{{ t(['दल्हा पर्वत की तलहटी, पोंडी (दल्हा), अकलतरा, जांजगीर-चांपा।', 'At the foot of Dalha hill, Pondi (Dalha), Akaltara, Janjgir-Champa.']) }}</span>
          <a class="more" [href]="mapOpen" target="_blank" rel="noopener">{{ t(['बड़े नक्शे में खोलें', 'Open in Google Maps']) }}</a>
        </div>
        @if (socials.length) {
          <div class="follow">
            <strong>{{ t(['हमसे जुड़ें', 'Follow us']) }}</strong>
            <div class="chips">
              @for (s of socials; track s.name) { <a [href]="s.url" target="_blank" rel="noopener">{{ s.name }}</a> }
            </div>
          </div>
        }
      </div>

    </div>
  </section>

  <!-- ═════ closing band ═════ -->
  <section class="band" aria-label="Support the Ashram">
    <span class="mark2" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container bbox">
      <h2>{{ t(['सेवा में सहभागी बनें', 'Be a part of the service']) }}</h2>
      <p>{{ t(['आपका सहयोग विद्यालय, चिकित्सालय और जैविक कृषि जैसे सेवा-कार्यों को आगे बढ़ाता है।', 'Your support carries forward the school, the hospital and the organic-farming work of the Ashram.']) }}</p>
      <div class="btns">
        <a class="btn btn-gold" routerLink="/donation">♥ {{ t(['सहयोग करें', 'Donate']) }}</a>
        <a class="btn btn-light" routerLink="/about">{{ t(['हमारे बारे में', 'About the Ashram']) }}</a>
      </div>
    </div>
  </section>`,
  styles: [`
  :host{display:block}
  a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--gold);outline-offset:2px}

  /* hero */
  .hero{position:relative;overflow:hidden;color:var(--ivory);padding:clamp(3rem,7vw,5.5rem) 0 clamp(6rem,10vw,8rem);border-bottom:3px solid var(--gold);
    background:radial-gradient(circle at 85% 0%,rgba(178,138,75,.32),transparent 55%),radial-gradient(circle at 0% 100%,rgba(0,0,0,.35),transparent 55%),linear-gradient(160deg,#4a2420,#2c1a15)}
  .mark{position:absolute;right:4%;top:50%;transform:translateY(-50%);font:700 min(55vw,440px)/1 var(--serif-hi);color:var(--gold);opacity:.07;pointer-events:none;user-select:none}
  .hbox{position:relative;max-width:1100px}
  .crumb{margin:0 0 1rem;font-size:.9rem;color:var(--sand)}
  .crumb a{color:var(--gold);text-decoration:none}.crumb a:hover{text-decoration:underline}
  h1{color:var(--ivory);font-size:clamp(2.4rem,6vw,4.4rem);line-height:1.08;margin:0;text-shadow:0 2px 18px rgba(0,0,0,.5)}
  .lead{max-width:56ch;margin:.4rem 0 1.4rem;font-size:clamp(1.05rem,2vw,1.3rem);color:var(--sand)}
  .lang{display:inline-flex;border:1px solid var(--gold);border-radius:999px;overflow:hidden}
  .lang button{min-height:40px;min-width:92px;padding:.3rem 1.1rem;border:0;background:transparent;color:var(--sand);font:500 .92rem var(--sans);cursor:pointer}
  .lang button.on{background:var(--gold);color:var(--brown);font-weight:600}

  /* contact cards – overlap the hero */
  .ways{position:relative;z-index:1;margin-top:calc(-1 * clamp(3.5rem,6vw,5rem))}
  .wgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4rem;align-items:stretch}
  .way{position:relative;display:flex;flex-direction:column;background:var(--ivory);border:1px solid var(--gold);border-top:4px solid var(--gold);outline:1px solid var(--sand);outline-offset:-8px;
    padding:2rem 1.6rem 1.7rem;box-shadow:0 18px 40px rgba(53,36,31,.22)}
  .ico{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:var(--maroon);color:var(--gold);border:1px solid var(--gold);box-shadow:0 0 0 5px var(--ivory),0 0 0 6px var(--gold);margin-bottom:1.2rem}
  .ico svg{width:26px;height:26px}
  .way h2{font-size:1.6rem;margin:0 0 .6rem}
  address{font-style:normal;display:grid;gap:.15rem;margin:0 0 1.2rem;color:var(--text)}
  address span:first-child{font-weight:600;color:var(--maroon)}
  .big{margin:0 0 .4rem;font:700 clamp(1.35rem,2.2vw,1.75rem)/1.3 var(--serif);word-break:break-word}
  .big a{color:var(--maroon);text-decoration:none;border-bottom:2px solid var(--gold)}
  .big a:hover{color:var(--brown)}
  .note{margin:0 0 1.2rem;color:var(--text)}
  .acts{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:auto}
  .acts .btn{flex:1 1 140px}

  /* form + map */
  .main{padding:clamp(3rem,6vw,5rem) 0}
  .mgrid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(2rem,5vw,4rem);align-items:start}
  .formcol h2{font-size:clamp(1.7rem,3.2vw,2.4rem);margin:0 0 .4rem}
  .sub{margin:0 0 1.6rem;max-width:58ch}
  .form{display:grid;gap:1.1rem}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem}
  .fld{display:grid;gap:.35rem}
  label{font-weight:600;color:var(--maroon);font-size:.95rem}
  input,select,textarea{width:100%;min-height:48px;padding:.7rem .9rem;border:1px solid #c8b48a;border-radius:2px;background:var(--white);color:var(--brown);font:400 1rem var(--sans);transition:border-color .2s,box-shadow .2s}
  textarea{resize:vertical;min-height:130px}
  input:hover,select:hover,textarea:hover{border-color:var(--gold)}
  input:focus,select:focus,textarea:focus{border-color:var(--maroon);box-shadow:0 0 0 3px rgba(178,138,75,.35);outline:none}
  [aria-invalid="true"]{border-color:#a3261a;background:#fff6f4}
  .err{min-height:1.1rem;font-size:.85rem;color:#a3261a}
  .submit{justify-self:start;min-width:200px}
  .ok{margin:0;padding:.8rem 1rem;border-left:3px solid var(--gold);background:var(--sand);color:var(--maroon);font-weight:500}

  .mapcol{display:grid;gap:1rem}
  .map{position:relative;aspect-ratio:4/3;border:1px solid var(--gold);padding:8px;background:var(--white);box-shadow:0 14px 30px rgba(53,36,31,.16)}
  .map iframe{width:100%;height:100%;border:0;display:block;filter:sepia(.18) saturate(.9)}
  .mapcap{display:grid;gap:.25rem;padding:1rem 1.2rem;background:var(--sand);border-left:3px solid var(--gold)}
  .mapcap strong,.follow strong{color:var(--maroon);font:700 1.2rem var(--serif)}
  .more{color:var(--maroon);font-weight:600;text-decoration:none;justify-self:start;border-bottom:1px solid var(--gold)}
  .more:hover{color:var(--brown)}
  .follow{display:grid;gap:.6rem}
  .chips{display:flex;flex-wrap:wrap;gap:.6rem}
  .chips a{border:1px solid var(--gold);border-radius:999px;padding:.35rem 1.1rem;color:var(--maroon);text-decoration:none;font-weight:500;transition:background .2s,color .2s}
  .chips a:hover{background:var(--maroon);color:var(--gold)}

  /* closing band */
  .band{position:relative;overflow:hidden;text-align:center;color:var(--ivory);padding:clamp(3rem,6vw,4.5rem) 0;border-top:3px solid var(--gold);
    background:radial-gradient(circle at 50% 100%,rgba(178,138,75,.28),transparent 60%),linear-gradient(180deg,#2c1a15,#4a2420)}
  .mark2{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 min(60vw,360px)/1 var(--serif-hi);color:var(--gold);opacity:.06;pointer-events:none}
  .bbox{position:relative;max-width:760px}
  .band h2{color:var(--ivory);font-size:clamp(1.7rem,3.4vw,2.5rem);margin:0 0 .5rem}
  .band p{margin:0 0 1.5rem;color:var(--sand);font-size:1.08rem}
  .btns{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap}

  @media(max-width:980px){.wgrid{grid-template-columns:1fr;max-width:560px;margin:0 auto}.mgrid{grid-template-columns:1fr}}
  @media(max-width:560px){.row2{grid-template-columns:1fr}.submit{justify-self:stretch}.mark{right:-10%}}
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}`],
})
export class ContactPageComponent {
  lang = signal<'en' | 'hi'>('en');
  copied = signal<'addr' | 'tel' | 'mail' | null>(null);
  sent = signal(false);
  errors = signal({ name: false, message: false });

  addr = ADDRESS_LINES; addressEn = ADDRESS_EN;
  phone = PHONE_SHOW; phoneHref = PHONE_HREF; email = EMAIL;
  topics = TOPICS; socials = SOCIALS;

  private q = encodeURIComponent(MAP_QUERY);
  dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${this.q}`;
  mapOpen = `https://www.google.com/maps/search/?api=1&query=${this.q}`;
  mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?q=${this.q}&z=14&output=embed`);

  constructor(title: Title) { title.setTitle(`Contact Us | ${SITE.short}`); }

  t(v: readonly string[]) { return this.lang() === 'hi' ? v[0] : v[1]; }

  async copy(key: 'addr' | 'tel' | 'mail', text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(key); setTimeout(() => this.copied.set(null), 2000);
    } catch { /* clipboard blocked: the details are visible on the page anyway */ }
  }

  send(e: Event, form: HTMLFormElement) {
    e.preventDefault();
    const d = new FormData(form);
    const name = String(d.get('name') ?? '').trim();
    const phone = String(d.get('phone') ?? '').trim();
    const topic = String(d.get('topic') ?? '').trim();
    const message = String(d.get('message') ?? '').trim();

    this.errors.set({ name: !name, message: !message });
    if (!name || !message) { this.sent.set(false); return; }

    const subject = `${topic || 'Website enquiry'} — ${name}`;
    const body = `${message}\n\n—\nName: ${name}${phone ? `\nPhone: ${phone}` : ''}`;
    this.sent.set(true);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}