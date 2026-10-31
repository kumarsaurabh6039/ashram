import type { FirebaseApp } from 'firebase/app';
import type { Bytes, Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

/**
 * Firebase Console -> Project settings -> General -> "Your apps" -> Web app (</>) -> SDK setup and configuration.
 * apiKey = same value as FIREBASE_WEB_API_KEY in chatbot-server/.env. These values are public by design (security comes from firestore.rules).
 */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC0OveiTfwkgAZ-oOW-ryc9xPjCzoPska8',
  authDomain: 'aghore-peetha.firebaseapp.com',
  projectId: 'aghore-peetha',
};

/** Same collection names the server used, so existing news / photos keep working. */
export const COL = { news: 'site_news', gallery: 'site_gallery', media: 'site_media' } as const;

// Loaded on demand (separate chunks) so the first page load does not get heavier.
let appP: Promise<FirebaseApp> | undefined;
const app = () => (appP ??= import('firebase/app').then((m) => (m.getApps().length ? m.getApp() : m.initializeApp(FIREBASE_CONFIG))));

export const fs = () => import('firebase/firestore');
export async function getDb(): Promise<Firestore> { const [a, f] = await Promise.all([app(), fs()]); return f.getFirestore(a); }
export async function getAuthInstance(): Promise<Auth> { const [a, m] = await Promise.all([app(), import('firebase/auth')]); return m.getAuth(a); }

/** Full-size photos live in site_media as bytes. Read once, then kept in memory. */
const memo = new Map<string, Promise<string | null>>();
export function mediaDataUrl(id: string): Promise<string | null> {
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return Promise.resolve(null);
  let p = memo.get(id);
  if (!p) {
    p = (async () => {
      const [db, f] = await Promise.all([getDb(), fs()]);
      const s = await f.getDoc(f.doc(db, COL.media, id));
      if (!s.exists()) return null;
      const d = s.data();
      return `data:${String(d['mime'])};base64,${(d['bytes'] as Bytes).toBase64()}`;
    })().catch(() => { memo.delete(id); return null; });
    memo.set(id, p);
    if (memo.size > 12) memo.delete(memo.keys().next().value as string);
  }
  return p;
}
export const forgetMedia = (id: string) => memo.delete(id);