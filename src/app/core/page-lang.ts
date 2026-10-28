import { Injectable, signal } from '@angular/core';
import { Bi } from './models';

export type PLang = 'en' | 'hi';
const KEY = 'page-lang';
const read = (): PLang => { try { return localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en'; } catch { return 'en'; } };

/** English / Hindi choice for the School, Hospital and Organic Farming pages. Remembered between pages and visits. */
@Injectable({ providedIn: 'root' })
export class PageLangService {
  lang = signal<PLang>(read());
  set(l: PLang) { this.lang.set(l); try { localStorage.setItem(KEY, l); } catch { /* private mode */ } }
  /** Picks the text for the current language (reads the signal, so templates update on toggle). */
  p = (b: Bi) => b[this.lang()];
}

/** Labels shared by the initiative pages. */
export const UI = {
  home: { en: 'Home', hi: 'होम' }, initiatives: { en: 'Initiatives', hi: 'पहलें' },
  about: { en: 'About this initiative', hi: 'इस पहल के बारे में' },
  soon: { en: 'More details coming soon', hi: 'और जानकारी जल्द आएगी' },
  soonText: { en: 'Photos and full information will be added here shortly.', hi: 'तस्वीरें और पूरी जानकारी जल्द ही यहाँ जोड़ी जाएँगी।' },
  helps: { en: 'Your contribution helps this seva continue and grow.', hi: 'आपका योगदान इस सेवा को जारी रखने और आगे बढ़ाने में मदद करता है।' },
  donate: { en: '♥ Donate', hi: '♥ दान करें' },
  questions: { en: 'Questions? Reach the Trust:', hi: 'कोई प्रश्न? ट्रस्ट से संपर्क करें:' },
  gallery: { en: 'Gallery', hi: 'गैलरी' }, photosSoon: { en: 'Photos will be added soon.', hi: 'फ़ोटो जल्द जोड़ी जाएँगी।' },
  videosSoon: { en: 'Videos will be added soon.', hi: 'वीडियो जल्द जोड़े जाएँगे।' },
  others: { en: 'Our Other Initiatives', hi: 'हमारी अन्य पहलें' },
  notFound: { en: 'Not found', hi: 'पृष्ठ नहीं मिला' }, back: { en: '← Back to Home', hi: '← होम पर वापस' },
  support: { en: 'Support', hi: 'सहयोग' },
} satisfies Record<string, Bi>;
