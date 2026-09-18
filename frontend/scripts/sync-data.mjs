/**
 * Copies the Quran data from ../backend/data into src/data so that Next.js
 * (a separate project/deploy target from the backend) can import it
 * directly for static generation. Runs automatically before `dev`/`build`.
 *
 * Prefers backend/data/quran.json (the full dataset produced by
 * `bun run fetch-data` in the backend) and falls back to the bundled
 * quran-sample.json so the site still builds with no setup at all.
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DATA = path.join(__dirname, "..", "..", "backend", "data");
const OUT_DIR = path.join(__dirname, "..", "src", "data");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

function copy(from, to, label) {
  const src = path.join(BACKEND_DATA, from);
  const dest = path.join(OUT_DIR, to);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`[sync-data] ${label}: copied ${from} -> src/data/${to}`);
    return true;
  }
  return false;
}

copy("surahs.json", "surahs.json", "Surah list");

const gotFull = copy("quran.json", "quran.json", "Ayah data (full)");
if (!gotFull) {
  copy("quran-sample.json", "quran.json", "Ayah data (sample fallback)");
  console.log(
    "[sync-data] Using the small bundled sample dataset. Run `bun run fetch-data` in backend/ for the complete 114-surah database, then re-run this."
  );
}
