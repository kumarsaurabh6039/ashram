export interface NavLink { label: string; path: string; exact?: boolean }
export interface NewsArticle {
  slug: string; title: string; excerpt: string; excerptIncomplete: boolean;
  date?: string; category?: string; image?: string; body?: string;
}
export interface Service { tag: string; title: string; text: string; path: string; image?: string }
export interface FestivalPart { title: string; hi: string; when: string; text: string }
export interface Festival {
  title: string; hi: string; text: string; when: string; whenHi: string;
  icon: 'moon' | 'diya' | 'ashram' | 'lotus';
  /** Optional: a card that holds more than one occasion (e.g. Sthapna + Avtaran Diwas). */
  parts?: FestivalPart[];
}
export interface GalleryImage { src: string; alt: string; caption?: string; category?: string }
export interface Quote { title: string; text: string }

/** English + Hindi text. */
export interface Bi { en: string; hi: string }
export interface InitiativeSection { title: Bi; text: Bi }
/** Detail page for School / Hospital / Organic Farming. Every visible text is English + Hindi. */
export interface Initiative {
  slug: string; path: string; image: string; imageAlt: string;
  tag: Bi; title: Bi; tagline: Bi; intro: Bi; donateLabel: Bi;
  highlights: Bi[]; sections: InitiativeSection[]; gallery: string[];
}