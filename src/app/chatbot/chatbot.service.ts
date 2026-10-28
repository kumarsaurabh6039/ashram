import { Injectable, computed, signal } from '@angular/core';
import { CHATBOT } from './chatbot.config';
import { LibItem, Lang, langOf, localReply } from './chatbot.logic';

export type Tab = 'chat' | 'story' | 'vani' | 'aarti';
export interface Msg { role: 'user' | 'assistant'; text: string; sources?: string[]; typing?: boolean }

export const T = {
  hi: { title: 'अघोर भक्ति सहायक', fab: 'सहायक', open: 'चैट खोलें', close: 'बंद करें', greet: 'जय माँ गुरु 🙏\nमैं अघोर परंपरा से जुड़े प्रश्नों में आपकी सहायता करने का प्रयास करूँगा।',
    warn: 'AI से गलती हो सकती है। ज़रूरी बातें आश्रम से पक्की कर लें।', ph: 'कुछ भी पूछिए…', send: 'भेजें', hello: 'मैं आपकी क्या सहायता करूँ?', dark: 'डार्क मोड', light: 'लाइट मोड', waking: 'सेवा शुरू हो रही है, कृपया 30-60 सेकंड रुकिए…', more: 'और विकल्प', newChat: 'नई चैट', adminLogin: 'एडमिन लॉगिन', adminPanel: 'एडमिन पैनल', adminTitle: 'एडमिन', logout: 'लॉगआउट', src: 'स्रोत', mic: 'बोलकर पूछें', micStop: 'रोकें', listening: 'सुन रहा हूँ… बोलिए', micDenied: 'माइक की अनुमति नहीं मिली। ब्राउज़र सेटिंग में माइक चालू करें।', micNone: 'आवाज़ सुनाई नहीं दी, फिर कोशिश करें।', micUnsupported: 'इस ब्राउज़र में बोलकर पूछना उपलब्ध नहीं है (Chrome / Edge आज़माएँ)।',
    tabs: { chat: 'चैट', story: 'किस्से', vani: 'वाणी', aarti: 'आरती' } as Record<Tab, string>,
    chips: [{ l: 'आश्रम में दान कैसे करें?', q: 'आश्रम में दान कैसे करें?' }, { l: 'आश्रम के बारे में बताइए', q: 'आश्रम के बारे में बताइए' }, { l: 'एक वाणी सुनाओ', q: 'एक वाणी सुनाओ' }, { l: 'कोई किस्सा सुनाओ', q: 'कोई किस्सा सुनाओ' }],
    listen: '🔊 सुनें', stop: '⏹ रोकें', copy: 'कॉपी', copied: '✓ कॉपी हो गया', tr: 'English में', orig: 'हिंदी में', search: 'वाणी खोजें…', random: 'आज की वाणी', all: 'सभी वाणी',
    novoice: 'इस डिवाइस पर हिंदी आवाज़ नहीं मिली।', trfail: 'अनुवाद अभी उपलब्ध नहीं।', liberr: 'सामग्री लोड नहीं हो पाई, कृपया दोबारा खोलें।', offline: 'अभी जवाब नहीं मिल पा रहा। आरती, वाणी या किस्से माँगकर देखिए, वे बिना इंटरनेट-सेवा के भी मिल जाते हैं।' },
  en: { title: 'Aghor Devotion Assistant', fab: 'Assistant', open: 'Open chat', close: 'Close', greet: 'Jai Maa Guru 🙏\nI will try to help with questions about the Aghor tradition.',
    warn: 'AI can make mistakes. Please confirm important details with the ashram.', ph: 'Ask anything…', send: 'Send', hello: 'What can I help with?', dark: 'Dark mode', light: 'Light mode', waking: 'Starting the service, please wait 30-60 seconds…', more: 'More options', newChat: 'New chat', adminLogin: 'Admin login', adminPanel: 'Admin panel', adminTitle: 'Admin', logout: 'Logout', src: 'Source', mic: 'Ask by voice', micStop: 'Stop', listening: 'Listening… speak now', micDenied: 'Microphone permission denied. Enable it in browser settings.', micNone: 'Could not hear anything, please try again.', micUnsupported: 'Voice input is not available in this browser (try Chrome / Edge).',
    tabs: { chat: 'Chat', story: 'Stories', vani: 'Vaniyan', aarti: 'Aarti' } as Record<Tab, string>,
    chips: [{ l: 'How can I donate?', q: 'How can I donate to the ashram?' }, { l: 'About the ashram', q: 'Tell me about the ashram' }, { l: 'Share a vani', q: 'one vani' }, { l: 'Tell me a story', q: 'tell me a story' }],
    listen: '🔊 Listen', stop: '⏹ Stop', copy: 'Copy', copied: '✓ Copied', tr: 'Translate to English', orig: 'Show Hindi', search: 'Search vaniyan…', random: 'Vani of the day', all: 'All vaniyan',
    novoice: 'No Hindi voice found on this device.', trfail: 'Translation unavailable right now.', liberr: 'Could not load the content, please reopen.', offline: 'I cannot reach the answer service right now. Try asking for an aarti, vani or story - those work without it.' },
};

const split = (t: string) => t.split(/(?<=[।.!?\n])/).reduce<string[]>((a, s) => {
  const last = a[a.length - 1];
  if (last !== undefined && (last + s).length < 180) a[a.length - 1] = last + s; else a.push(s);
  return a;
}, []).map((s) => s.trim()).filter(Boolean);

async function http(path: string, body: unknown, ms = 30000): Promise<Response> {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(`${CHATBOT.apiBase}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: c.signal }); }
  finally { clearTimeout(t); }
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  lang = signal<Lang>(this.savedLang());
  t = computed(() => T[this.lang()]);
  library = signal<LibItem[]>([]);
  libError = signal(false);
  messages = signal<Msg[]>([]);
  busy = signal(false);
  tr = signal<Record<string, string>>({});
  showTr = signal<Record<string, boolean>>({});
  playing = signal<string | null>(null);
  note = signal('');
  waking = signal(false);
  private awake = false;
  listening = signal(false);
  voiceOk = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  private rec: any = null;
  private revealTimer: ReturnType<typeof setInterval> | null = null;
  private audio: HTMLAudioElement | null = null;
  private loaded = false;

  private savedLang(): Lang { try { return localStorage.getItem('ac-lang') === 'en' ? 'en' : 'hi'; } catch { return 'hi'; } }
  setLang(l: Lang) { this.lang.set(l); try { localStorage.setItem('ac-lang', l); } catch { /* private mode */ } }

  async loadLibrary() {
    if (this.loaded) return; this.loaded = true;
    try { const r = await fetch(CHATBOT.libraryUrl); if (!r.ok) throw 0; this.library.set(await r.json()); this.libError.set(false); }
    catch { this.loaded = false; this.libError.set(true); }
  }

  /** Free hosts put the server to sleep when idle. Ping it as soon as the chat opens so it is awake by the time the person types. */
  async wake() {
    if (this.awake || this.waking()) return;
    const slow = setTimeout(() => this.waking.set(true), 2500);
    try { const c = new AbortController(); const to = setTimeout(() => c.abort(), 90000); const r = await fetch(`${CHATBOT.apiBase}/health`, { signal: c.signal }); clearTimeout(to); this.awake = r.ok; }
    catch { /* offline: send() falls back to the built-in library */ }
    clearTimeout(slow); this.waking.set(false);
  }

  /** The server decides the answer (uploaded Firestore data first). The built-in library is only a fallback when the server is unreachable. */
  async send(raw: string) {
    const text = raw.trim().slice(0, 500);
    if (!text || this.busy()) return;
    this.stop(); this.stopVoice();
    await this.loadLibrary();
    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.busy.set(true);
    let reply = ''; let sources: string[] | undefined;
    try {
      const history = this.messages().slice(-8).map((m) => ({ role: m.role, content: m.text }));
      const r = await http('/chat', { lang: this.lang(), messages: history }, 90000);
      const j = await r.json();
      if (r.ok && j.reply) {
        reply = String(j.reply);
        const names = (j.sources ?? []).map((s: { source: string }) => s.source);
        if (j.provider !== 'none' && j.provider !== 'rule') sources = [...new Set<string>(names)].slice(0, 3);
      } else reply = String(j.error ?? this.t().offline);
    } catch { reply = localReply(text, this.lang(), this.library()) ?? this.t().offline; }
    this.busy.set(false);
    this.reveal(reply, sources);
  }

  /** ChatGPT-style gradual reveal; finishes within ~1.5 s however long the answer is. */
  private reveal(full: string, sources?: string[]) {
    this.clearReveal();
    const idx = this.messages().length;
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) { this.messages.update((m) => [...m, { role: 'assistant', text: full, sources }]); return; }
    this.messages.update((m) => [...m, { role: 'assistant', text: '', typing: true }]);
    const step = Math.max(3, Math.ceil(full.length / 90)); let n = 0;
    this.revealTimer = setInterval(() => {
      n = Math.min(full.length, n + step); const done = n >= full.length;
      this.messages.update((m) => m.map((x, i) => (i === idx ? { role: 'assistant' as const, text: full.slice(0, n), typing: !done, sources: done ? sources : undefined } : x)));
      if (done) this.clearReveal();
    }, 16);
  }
  private clearReveal() { if (this.revealTimer) clearInterval(this.revealTimer); this.revealTimer = null; }

  newChat() { this.clearReveal(); this.stop(); this.stopVoice(); this.messages.set([]); this.note.set(''); this.busy.set(false); }

  /** Speech-to-text with the browser's own recogniser (free; Chrome / Edge / Android; needs https or localhost). Sends automatically when you stop speaking. */
  toggleVoice(setDraft: (s: string) => void) {
    if (this.listening()) return this.stopVoice();
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return this.note.set(this.t().micUnsupported);
    this.stop(); this.note.set('');
    const rec = new SR(); this.rec = rec;
    rec.lang = this.lang() === 'hi' ? 'hi-IN' : 'en-IN'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) { const tr = e.results[i][0].transcript; if (e.results[i].isFinal) finalText += tr; else interim += tr; }
      setDraft((finalText + interim).trim());
    };
    rec.onerror = (e: any) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') this.note.set(this.t().micDenied); else if (e.error === 'no-speech') this.note.set(this.t().micNone); };
    rec.onend = () => { this.listening.set(false); this.rec = null; const v = finalText.trim(); if (v) { setDraft(''); void this.send(v); } };
    try { rec.start(); this.listening.set(true); } catch { this.listening.set(false); }
  }
  stopVoice() { try { this.rec?.stop(); } catch { /* ignore */ } }

  shown(i: LibItem) { return (this.showTr()[i.id] && this.tr()[i.id]) || i.text; }
  async toggleTranslate(i: LibItem) {
    this.note.set('');
    if (this.showTr()[i.id]) return this.showTr.update((p) => ({ ...p, [i.id]: false }));
    if (!this.tr()[i.id]) {
      try {
        const r = await http('/translate', { text: i.text }); const j = await r.json();
        if (!r.ok) throw 0; this.tr.update((p) => ({ ...p, [i.id]: String(j.text) }));
      } catch { this.note.set(this.t().trfail); return; }
    }
    this.showTr.update((p) => ({ ...p, [i.id]: true }));
  }

  copy(text: string) { try { navigator.clipboard?.writeText(text); } catch { /* ignore */ } }

  stop() { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); this.audio?.pause(); this.audio = null; this.playing.set(null); }
  toggleSpeak(id: string, text: string) { if (this.playing() === id) this.stop(); else void this.speak(id, text); }

  /** Browser voice first (free, offline); falls back to the server's Gemini TTS if the device has no Hindi voice. */
  private async speak(id: string, text: string) {
    this.stop(); this.note.set(''); this.playing.set(id);
    const lang = langOf(text);
    const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    const voices = synth?.getVoices() ?? [];
    const voice = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
    const viaBrowser = () => {
      const parts = split(text);
      parts.forEach((p, n) => {
        const u = new SpeechSynthesisUtterance(p); u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; u.rate = 0.9; if (voice) u.voice = voice;
        if (n === parts.length - 1) { u.onend = () => this.playing.update((c) => (c === id ? null : c)); u.onerror = u.onend; }
        synth!.speak(u);
      });
    };
    if (synth && (voice || voices.length === 0)) return viaBrowser();
    try {
      const r = await http('/tts', { text: text.slice(0, 1500) }, 45000); if (!r.ok) throw 0;
      const a = new Audio(URL.createObjectURL(await r.blob())); this.audio = a;
      a.onended = () => this.playing.update((c) => (c === id ? null : c)); await a.play();
    } catch { this.note.set(this.t().novoice); if (synth) viaBrowser(); else this.playing.set(null); }
  }
}
