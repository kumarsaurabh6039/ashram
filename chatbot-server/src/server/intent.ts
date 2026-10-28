import { LIBRARY, type LibItem } from "./library.js";
import { retrieve } from "./rag/retriever.js";
import type { Lang } from "./types.js";

const AARTI = /आरती|aarti|aarathi|arti\b|aartee/i;
const VANI = /वाणी|वचन|विचार|उपदेश|सुविचार|vani|vaani|vachan|vichar|updesh|suvichar|amritvani|quote/i;
const STORY = /किस्स|कहानी|कथा|जीवन\s*परिचय|kissa|kisse|kahani|katha|story|stories|biography|jeevan/i;
const ALL = /सब|सभी|सारे|\ball\b|\bsab\b|\bsabhi\b|\bsaare\b/i;

const byKind = (k: LibItem["kind"]) => LIBRARY.filter((i) => i.kind === k);
const pick = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n);
const head = (lang: Lang) => (lang === "hi" ? "जय माँ गुरु 🙏\n\n" : "Jai Maa Guru 🙏\n\n");

const REQUEST = /सुना|दीजिए|दीजिये|चाहिए|चाहिये|भेज|बता|दिखा|दो\b|sunao|sunaiye|sunaye|chahiye|chahie|chaahiye|chahiyen|bhejo|bhej\b|dijiye|batao|bataiye|dikhao|\b(give|share|send|show|tell|want|need|list)\b|\d/i;
const ABOUT = /क्या है|कौन है|मतलब|बारे में|kya hai|kaun hai|\bwhat is\b|\bwho is\b|matlab|meaning|bare me|explain|samjha/i;

const NUM_WORDS: [RegExp, number][] = [
  [/\b(ek|one)\b|एक/i, 1], [/\b(teen|three)\b|तीन/i, 3], [/\b(chaar|char|four)\b|चार/i, 4],
  [/\b(paanch|panch|five)\b|पाँच|पांच/i, 5], [/\b(chhe|chhah|six)\b|छह|छः|छ:/i, 6], [/\b(saat|seven)\b|सात/i, 7],
  [/\b(aath|eight)\b|आठ/i, 8], [/\b(nau|nine)\b|नौ/i, 9], [/\b(das|ten)\b|दस/i, 10],
];
/** How many items the person asked for ("10 vani", "paanch vani", "ek vani"), or null. ("do" is not read as 2: it also means "give".) */
export function wantedCount(q: string): number | null {
  const d = /(?<![\d.])(\d{1,2})(?![\d.])/.exec(q);
  if (d) { const n = Number(d[1]); if (n >= 1) return Math.min(n, 20); }
  for (const [re, n] of NUM_WORDS) if (re.test(q)) return n;
  return null;
}

export type Extra = Partial<Record<"vani" | "story" | "aarti", string[]>>;

/** Returns a ready answer straight from the library for "give me aarti / vani / story" requests, else null.
 *  `extra` = passages the admin uploaded under the same category; they are mixed in with the built-in library. */
export function directReply(q: string, lang: Lang, extra: Extra = {}): string | null {
  if (q.length > 110) return null;                       // long questions go through search / the LLM
  if (ABOUT.test(q) && !REQUEST.test(q)) return null;    // "aghorvani kya hai?" is a question, not a request for vani
  if (AARTI.test(q)) {
    const a = byKind("aarti")[0];
    if (a) return `${head(lang)}${a.title}\n\n${a.text}`;
    const up = pick(extra.aarti ?? [], 1)[0];
    return up ? `${head(lang)}${up}` : null;
  }
  if (STORY.test(q)) {
    const stories = byKind("story");
    if (ALL.test(q)) {
      const list = stories.map((s, i) => `${i + 1}. ${lang === "hi" ? s.title : s.titleEn}`).join("\n");
      return head(lang) + (lang === "hi" ? `अघोरेश्वर भगवान राम जी के किस्से:\n\n${list}\n\nकिसी का नाम या विषय लिखिए, मैं पूरा किस्सा सुना दूँगा।` : `Stories of Aghoreshwar Bhagwan Ram:\n\n${list}\n\nName one and I will share the full story.`);
    }
    const intro = /परिचय|parichay|introduction|biography|जीवन|jeevan/i.test(q);
    const hit = retrieve(q, 8).map((e) => stories.find((s) => s.id === e.id && (intro || s.id !== "K0"))).find(Boolean);
    const up = extra.story ?? [];
    if (!hit && up.length && Math.random() < up.length / (up.length + stories.length)) return `${head(lang)}${pick(up, 1)[0]}`;
    const s = hit ?? pick(stories.filter((x) => x.id !== "K0"), 1)[0];
    return `${head(lang)}${s.title}\n\n${s.text}`;
  }
  if (VANI.test(q)) {
    const vani = byKind("vani");
    const n = wantedCount(q) ?? (ALL.test(q) ? 10 : 3);
    const up = pick(extra.vani ?? [], Math.min((extra.vani ?? []).length, Math.ceil(n / 2)));   // uploaded vani gets its share
    const need = n - up.length;
    const topical = retrieve(q, 40).map((e) => vani.find((v) => v.id === e.id)).filter((v): v is LibItem => !!v).slice(0, need);
    const rest = pick(vani.filter((v) => !topical.includes(v)), Math.max(0, need - topical.length));   // top up so "10 vani" really gives 10
    const label = lang === "hi" ? "अघोरेश्वर वाणी" : "Aghoreshwar Vani";
    const blocks = [...topical, ...rest].map((v) => `“${v.text}”\n— ${label} ${v.id.slice(1)}`);
    const all = [...blocks, ...up.map((t) => t.trim())];
    if (!all.length) return null;
    return `${head(lang)}${all.join("\n\n")}`;
  }
  return null;
}