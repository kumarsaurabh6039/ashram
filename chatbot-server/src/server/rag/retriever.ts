import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { KbEntry } from "../types.js";

const here = dirname(fileURLToPath(import.meta.url));
const kbPath = process.env.KB_PATH ?? join(here, "../../../src/data/knowledge.json");
const KB: KbEntry[] = JSON.parse(readFileSync(kbPath, "utf8"));

// Hindi/English tokenizer: keeps Devanagari + latin letters/digits
const tok = (s: string) => s.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 1);

// Roman-Hindi (Hinglish) hints so "guru seva" or "sanyam" still hit Devanagari entries
const ALIASES: Record<string, string[]> = {
  guru: ["गुरु"], seva: ["सेवा", "service"], sanyam: ["संयम", "restraint"], shraddha: ["श्रद्धा", "faith"],
  samay: ["समय", "time"], kinaram: ["कीनाराम"], aghor: ["अघोर"], aghoreshwar: ["अघोरेश्वर"],
  ninda: ["निंदा", "निन्दा"], nindha: ["निंदा", "निन्दा"], havan: ["हवन"], tantra: ["तन्त्र", "तंत्र"], dhyan: ["ध्यान", "meditation"],
  karm: ["कर्म", "karma"], sanskar: ["संस्कार"], vriddh: ["वृद्ध", "elders"], nasha: ["नशा", "intoxicants"],
  sharab: ["शराब"], mehnat: ["परिश्रम", "मेहनत"], vinamrata: ["नम्रता", "humility"], rin: ["ऋण", "debt"], sankalp: ["संकल्प"],
  bhay: ["भय", "fear"], darr: ["भय", "fear"], dar: ["भय", "fear"], dahej: ["दहेज"], krodh: ["क्रोध", "anger"], gussa: ["क्रोध", "anger"],
  lobh: ["लोभ", "greed"], chinta: ["चिंता", "worry"], maut: ["मृत्यु", "death"], mrityu: ["मृत्यु", "death"], kshama: ["क्षमा", "forgiveness"],
  dost: ["मित्र", "friend"], mitra: ["मित्र", "friend"], maun: ["मौन", "silence"], ahankar: ["अहंकार", "ego"], bhagwan: ["भगवान"], ram: ["राम"],
  kahani: ["किस्से", "story"], kissa: ["किस्से", "story"], mata: ["माता"], pita: ["पिता"], sant: ["संत", "सन्त"], sadhana: ["साधना"], santosh: ["संतोष"],
  shanti: ["शांति", "शान्ति", "peace"], prem: ["प्रेम"], dukh: ["दुःख", "दुख", "sorrow"], nirasha: ["निराशा", "despair"], dhairya: ["धैर्य", "patience"],
  jati: ["जाति"], shiksha: ["शिक्षा", "education"], prakriti: ["प्रकृति", "nature"], vishwas: ["विश्वास", "trust"], eemandari: ["ईमानदारी", "honesty"],
  mandir: ["मंदिर", "temple"], yuva: ["युवा", "youth"], abhimaan: ["अभिमान", "ego"], sukh: ["सुख"],
};

const STOP = new Set("है हैं का की के में से को पर और यह वह कि तो भी ही न नहीं एक क्या कैसे कौन the is are of and to in a an what how why who kya hai hain ka ki ke me mein se ko par aur kaise kyun kaun mujhe batao bataiye karein kare karo".split(" "));

export function retrieve(query: string, k = 4): KbEntry[] {
  const q = new Set<string>();
  for (const t of tok(query)) { if (STOP.has(t)) continue; q.add(t); (ALIASES[t] ?? []).forEach((a) => q.add(a)); }
  const scored = KB.map((e) => {
    const hay = tok(`${e.hi} ${e.en} ${e.tags.join(" ")}`);
    const set = new Set(hay);
    let s = 0;
    for (const t of q) {
      if (set.has(t)) s += 2;
      else if (t.length > 3 && hay.some((h) => h.startsWith(t.slice(0, Math.max(3, t.length - 2))))) s += 1;
      if (e.tags.includes(t)) s += 3;
    }
    return { e, s };
  }).filter((x) => x.s >= 2).sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map((x) => x.e);
}
export const kbSize = () => KB.length;
