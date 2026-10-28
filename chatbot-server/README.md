# Devotion Chatbot (Aghor) — drop-in module

## Run
    cp .env.example .env     # add GEMINI_API_KEY and GROQ_API_KEY
    npm install && npm run dev

API: `POST /api/chat` `{ lang: "hi"|"en", messages: [{role, content}] }` → `{ reply, provider, sources[], webLinks[] }`

## Use
Backend for the Angular site's chat widget (see ../src/app/chatbot).

## How it answers
Ask for an aarti / vani / kissa and `src/server/intent.ts` returns the text straight from `library.json` (no LLM, instant, exact). Other questions are answered by Gemini→Groq using the best matching passages from `knowledge.json`; the prompt forbids inventing quotes or stories.

## Feeding more text
    npm run ingest -- path/to/book.txt "Book name, edition" B   # appends verbatim chunks as verified entries

## Not included on purpose
Scraping Facebook/Instagram violates their terms and is blocked by login walls. Instead, paste text you are
permitted to use (Ashram posts, books) into knowledge.json.

## Library + listening
`src/data/library.json` holds stories, vaniyan and the aarti; the UI tabs read it via `GET /api/library`.
Listen: browser speech (Hindi voice if the device has one) with automatic fallback to `POST /api/tts` (Gemini TTS, cached).
"Translate" uses `POST /api/translate` (same Gemini→Groq failover). Items marked `unverified` are shown with a notice.
