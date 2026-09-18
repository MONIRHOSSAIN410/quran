/**
 * Downloads the complete Quran database (114 surahs, 6236 ayahs) with
 * Arabic text (Uthmani script) and the Sahih International English
 * translation, from the free Al Quran Cloud API:
 *   https://alquran.cloud/api
 *
 * Requires internet access. Run once with:
 *   bun run fetch-data
 *   (or: node scripts/fetch-data.mjs)
 *
 * Writes the result to backend/data/quran.json, which the API server
 * automatically prefers over the small bundled sample dataset.
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "quran.json");

const BASE_URL = "https://api.alquran.cloud/v1/surah";
const EDITIONS = "quran-uthmani,en.sahih";
const TOTAL_SURAHS = 114;
const DELAY_MS = 250; // be polite to the free API
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSurah(number) {
  const url = `${BASE_URL}/${number}/editions/${EDITIONS}`;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const [arabicEdition, translationEdition] = json.data;

      const ayahs = arabicEdition.ayahs.map((ayah, i) => ({
        numberInSurah: ayah.numberInSurah,
        arabic: ayah.text,
        translation: translationEdition.ayahs[i]?.text ?? "",
      }));

      return ayahs;
    } catch (err) {
      console.warn(
        `  Surah ${number}: attempt ${attempt}/${MAX_RETRIES} failed (${err.message})`
      );
      if (attempt === MAX_RETRIES) throw err;
      await sleep(500 * attempt);
    }
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  // Resume from an existing partial download if one exists.
  let result = {};
  if (existsSync(OUT_FILE)) {
    try {
      result = JSON.parse(readFileSync(OUT_FILE, "utf-8"));
      console.log(
        `Found existing quran.json with ${Object.keys(result).length} surah(s) already downloaded — resuming.`
      );
    } catch {
      result = {};
    }
  }

  console.log(`Downloading ${TOTAL_SURAHS} surahs from Al Quran Cloud API...`);

  for (let n = 1; n <= TOTAL_SURAHS; n++) {
    if (result[String(n)]) {
      continue; // already downloaded
    }
    process.stdout.write(`  Surah ${n}/${TOTAL_SURAHS}...`);
    try {
      const ayahs = await fetchSurah(n);
      result[String(n)] = ayahs;
      writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), "utf-8");
      console.log(` done (${ayahs.length} ayahs)`);
    } catch (err) {
      console.log(` FAILED (${err.message}) — you can re-run this script to retry.`);
    }
    await sleep(DELAY_MS);
  }

  const count = Object.keys(result).length;
  console.log(`\nFinished. ${count}/${TOTAL_SURAHS} surahs saved to ${OUT_FILE}`);
  if (count < TOTAL_SURAHS) {
    console.log("Some surahs failed to download — re-run this script to retry only the missing ones.");
  }
}

main().catch((err) => {
  console.error("Fatal error while fetching Quran data:", err);
  process.exit(1);
});
