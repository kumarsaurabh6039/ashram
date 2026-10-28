/** Small shared helper for Gemini REST calls (retries on 429 / 5xx with back-off). */
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function geminiPost(path: string, body: unknown, timeoutMs = 120_000, tries = 4): Promise<any> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  let lastErr = "";
  for (let attempt = 0; attempt < tries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(`${BASE}/${path}`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body), signal: ctrl.signal,
      });
      if (r.ok) return await r.json();
      lastErr = `${r.status} ${(await r.text()).slice(0, 300)}`;
      if (![429, 500, 502, 503, 504].includes(r.status)) break;       // not worth retrying
    } catch (e: any) { lastErr = e?.name === "AbortError" ? "timeout" : String(e?.message ?? e); }
    finally { clearTimeout(timer); }
    await new Promise((res) => setTimeout(res, 2000 * 2 ** attempt));
  }
  throw new Error(`Gemini request failed: ${lastErr}`);
}
