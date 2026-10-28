import { existsSync, readFileSync } from "node:fs";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** True when a service account (or Google default credentials) is configured. */
export function firebaseConfigured(): boolean {
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || (p && existsSync(p)) || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

function init() {
  if (getApps().length) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (json) initializeApp({ credential: cert(JSON.parse(json)) });
  else if (path && existsSync(path)) initializeApp({ credential: cert(JSON.parse(readFileSync(path, "utf8"))) });
  else initializeApp({ credential: applicationDefault() });
}

export const db = () => { init(); return getFirestore(); };
export const adminAuth = () => { init(); return getAuth(); };
