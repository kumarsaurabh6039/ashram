/** Pure helpers (no Angular) so the main requests work instantly and even without the server. */
export type Lang = 'hi' | 'en';
export type Kind = 'story' | 'vani' | 'aarti';
export interface LibItem { id: string; kind: Kind; title: string; titleEn: string; text: string; summaryEn?: string; group?: string; groupEn?: string }

export const DEVA = /[\u0900-\u097F]/;
export const langOf = (s: string): Lang => (DEVA.test(s) ? 'hi' : 'en');

const P = {
  aarti: 'आरती|aarti|aarathi|\\barti\\b|aartee',
  vani: 'वाणी|वचन|विचार|उपदेश|सुविचार|vani|vaani|vachan|vichar|updesh|suvichar|amritvani|quote',
  story: 'किस्स|कहानी|कथा|जीवन\\s*परिचय|kissa|kisse|kahani|katha|story|stories|biography|jeevan',
  all: 'सब|सभी|सारे|\\ball\\b|\\bsab\\b|\\bsabhi\\b|\\bsaare\\b',
};
const has = (k: keyof typeof P, q: string) => new RegExp(P[k], 'i').test(q);
const strip = (q: string) => q.replace(new RegExp(`${P.aarti}|${P.vani}|${P.story}|${P.all}`, 'gi'), ' ');

const STOP = new Set('है हैं का की के में से को पर और यह वह the is are of and to in a an kya hai hain ka ki ke me mein se ko par aur kaise kyun mujhe batao bataiye sunao suna do dijiye dena karein ek kuch koi aaj meri mere ji please'.split(' '));
const ALIAS: Record<string, string[]> = {
  bhay: ['भय'], darr: ['भय'], dar: ['भय'], fear: ['भय'], krodh: ['क्रोध'], gussa: ['क्रोध'], anger: ['क्रोध'], lobh: ['लोभ'], chinta: ['चिंता'], seva: ['सेवा'], service: ['सेवा'],
  guru: ['गुरु'], samay: ['समय'], time: ['समय'], mata: ['माता'], pita: ['पिता'], parents: ['माता-पिता'], maut: ['मृत्यु'], mrityu: ['मृत्यु'], death: ['मृत्यु'], kshama: ['क्षमा'],
  dost: ['मित्र'], mitra: ['मित्र'], friend: ['मित्र'], maun: ['मौन'], ahankar: ['अहंकार'], ego: ['अहंकार'], shanti: ['शांति', 'शान्ति'], peace: ['शांति'], prem: ['प्रेम'],
  dahej: ['दहेज'], shiksha: ['शिक्षा'], ishwar: ['ईश्वर', 'परमात्मा'], bhakti: ['भक्ति'], samarpan: ['समर्पण'], nirasha: ['निराशा'], dhairya: ['धैर्य'], vishwas: ['विश्वास'],
  imandari: ['ईमानदारी'], sanyam: ['संयम'], ninda: ['निंदा', 'निन्दा'], nindha: ['निंदा', 'निन्दा'], mehnat: ['परिश्रम'], bachpan: ['बचपन'], chandrashekhar: ['चंद्रशेखर'],
  yagya: ['यज्ञ'], krim: ['क्रीं'], kreem: ['क्रीं'], sdm: ['sdm'], dukh: ['दुःख', 'दुख'], sukh: ['सुख'],
};

function score(i: LibItem, topic: string): number {
  const toks = topic.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 1 && !STOP.has(w));
  const hay = `${i.text} ${i.title} ${i.titleEn} ${i.group ?? ''} ${i.groupEn ?? ''}`.toLowerCase();
  let s = 0;
  for (const t of toks) for (const w of [t, ...(ALIAS[t] ?? [])]) if (hay.includes(w)) { s++; break; }
  return s;
}
const pick = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n);
const head = (l: Lang) => (l === 'hi' ? 'जय माँ गुरु 🙏\n\n' : 'Jai Maa Guru 🙏\n\n');

/** Ready answer from the library for "give me aarti / vani / story" style requests, else null. */
export function localReply(q: string, lang: Lang, lib: LibItem[]): string | null {
  if (!lib.length || q.length > 110) return null;
  const of = (k: Kind) => lib.filter((i) => i.kind === k);
  const best = (items: LibItem[]) => items.map((i) => ({ i, s: score(i, strip(q)) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.i);

  if (has('aarti', q)) { const a = of('aarti')[0]; return a ? `${head(lang)}${a.title}\n\n${a.text}` : null; }
  if (has('story', q)) {
    const st = of('story');
    if (has('all', q)) {
      const list = st.map((s, n) => `${n + 1}. ${lang === 'hi' ? s.title : s.titleEn}`).join('\n');
      return head(lang) + (lang === 'hi' ? `अघोरेश्वर भगवान राम जी के किस्से:\n\n${list}\n\nकिसी का नाम या विषय लिखिए, मैं पूरा किस्सा सुना दूँगा।` : `Stories of Aghoreshwar Bhagwan Ram:\n\n${list}\n\nName one and I will share the full story.`);
    }
    const intro = /परिचय|parichay|introduction|biography|जीवन|jeevan/i.test(q);
    const pool = st.filter((s) => s.id !== 'K0');
    const s = (intro ? st.find((x) => x.id === 'K0') : undefined) ?? best(pool)[0] ?? pick(pool, 1)[0];
    return `${head(lang)}${s.title}\n\n${s.text}`;
  }
  if (has('vani', q)) {
    const vani = of('vani');
    const n = /\b(ek|one|1)\b|एक/i.test(q) ? 1 : /\b(5|five|paanch)\b|पाँच|पांच/i.test(q) ? 5 : 3;
    const hits = best(vani).slice(0, n);
    const body = (hits.length ? hits : pick(vani, n)).map((v) => `“${v.text}”\n— ${lang === 'hi' ? 'अघोरेश्वर वाणी' : 'Aghoreshwar Vani'} ${v.id.slice(1)}`).join('\n\n');
    return `${head(lang)}${body}`;
  }
  return null;
}
