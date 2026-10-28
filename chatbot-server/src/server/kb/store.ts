import { db } from "../firebase.js";

export type DocKind = "pdf" | "image" | "text";
export type DocStatus = "processing" | "ready" | "failed";
export interface DocMeta {
  id: string; title: string; category: string; kind: DocKind; fileName?: string; note?: string;
  status: DocStatus; stage?: string; progress?: { done: number; total: number }; error?: string;
  chunkCount: number; charCount: number; createdAt: number; createdBy: string;
}
export interface Chunk { id: string; docId: string; title: string; category: string; idx: number; text: string; vec: Float32Array }

const DOCS = "kb_documents", CHUNKS = "kb_chunks";
let cache: Chunk[] = [];
export const cachedChunks = () => cache;
export const cacheSize = () => cache.length;

const toBuf = (v: Float32Array) => Buffer.from(v.buffer, v.byteOffset, v.byteLength);
const fromBytes = (b: Uint8Array) => { const ab = new ArrayBuffer(b.byteLength); new Uint8Array(ab).set(b); return new Float32Array(ab); };

/** Loads every chunk into memory (one read per chunk) - search then costs no Firestore reads. */
export async function loadCache(): Promise<void> {
  const snap = await db().collection(CHUNKS).get();
  cache = snap.docs.map((d: any) => {
    const x = d.data();
    return { id: d.id, docId: x.docId, title: x.title, category: x.category, idx: x.idx, text: x.text, vec: fromBytes(x.embedding) };
  });
  // a server restart mid-processing leaves documents stuck; mark them failed so the admin can retry
  const stuck = await db().collection(DOCS).where("status", "==", "processing").get();
  await Promise.all(stuck.docs.map((d: any) => d.ref.update({ status: "failed", error: "Server restart ke karan ruk gaya, dobara upload karein." })));
}

export async function listDocs(): Promise<DocMeta[]> {
  const snap = await db().collection(DOCS).orderBy("createdAt", "desc").limit(300).get();
  return snap.docs.map((d: any) => d.data() as DocMeta);
}
export const newDocId = () => db().collection(DOCS).doc().id;
export const saveDoc = (m: DocMeta) => db().collection(DOCS).doc(m.id).set(JSON.parse(JSON.stringify(m)));
export const patchDoc = (id: string, p: Partial<DocMeta>) => db().collection(DOCS).doc(id).update(JSON.parse(JSON.stringify(p)));
export async function getDoc(id: string): Promise<DocMeta | null> {
  const s = await db().collection(DOCS).doc(id).get(); return s.exists ? (s.data() as DocMeta) : null;
}

export async function saveChunks(doc: DocMeta, texts: string[], vecs: Float32Array[]): Promise<void> {
  const chunks: Chunk[] = texts.map((text, idx) => ({ id: `${doc.id}_${idx}`, docId: doc.id, title: doc.title, category: doc.category, idx, text, vec: vecs[idx] }));
  for (let i = 0; i < chunks.length; i += 400) {
    const batch = db().batch();
    for (const c of chunks.slice(i, i + 400))
      batch.set(db().collection(CHUNKS).doc(c.id), { docId: c.docId, title: c.title, category: c.category, idx: c.idx, text: c.text, embedding: toBuf(c.vec) });
    await batch.commit();
  }
  cache = [...cache.filter((c) => c.docId !== doc.id), ...chunks];
}

export async function deleteDoc(id: string): Promise<void> {
  const snap = await db().collection(CHUNKS).where("docId", "==", id).get();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db().batch(); snap.docs.slice(i, i + 400).forEach((d: any) => batch.delete(d.ref)); await batch.commit();
  }
  await db().collection(DOCS).doc(id).delete();
  cache = cache.filter((c) => c.docId !== id);
}

export const previewChunks = (id: string, n = 3) => cache.filter((c) => c.docId === id).sort((a, b) => a.idx - b.idx).slice(0, n).map((c) => c.text);

/** Set once at start-up. Chat waits for it (max 20 s) so a cold start never answers "no information" just because data is still loading. */
let loading: Promise<void> = Promise.resolve();
export const startLoading = () => { loading = loadCache(); return loading; };
export const whenLoaded = () => Promise.race([loading.catch(() => {}), new Promise<void>((r) => setTimeout(r, 20_000))]);
