export type Lang = "hi" | "en";
export interface ChatMessage { role: "user" | "assistant"; content: string }
export interface KbEntry {
  id: string;
  source: string;
  verified: boolean;        // true = taken from the supplied PDFs / confirmed text
  tags: string[];
  hi: string;
  en: string;
}
export interface ChatRequest { messages: ChatMessage[]; lang: Lang }
export interface ChatResponse {
  reply: string;
  provider: "gemini" | "groq" | "library" | "rule" | "none" | "kb";
  sources: { id: string; source: string; verified: boolean; category?: string }[];
  usedWeb: boolean;
  webLinks?: { title: string; uri: string }[];
}