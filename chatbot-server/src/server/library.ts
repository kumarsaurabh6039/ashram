import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export interface LibItem {
  id: string; kind: "story" | "vani" | "aarti"; title: string; titleEn: string; text: string;
  summaryEn?: string; group?: string; groupEn?: string; badge: "unverified" | "supplied"; source: string;
}
const here = dirname(fileURLToPath(import.meta.url));
export const LIBRARY: LibItem[] = JSON.parse(readFileSync(process.env.LIB_PATH ?? join(here, "../../src/data/library.json"), "utf8"));
