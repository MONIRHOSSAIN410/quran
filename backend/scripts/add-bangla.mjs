/**
 * Adds the two Bangla fields to an existing Qur'an dataset:
 *
 *   pronunciation  বাংলা উচ্চারণ  — generated offline from the Arabic text
 *                                   by src/bangla-translit.mjs (no network)
 *   bangla         বাংলা অনুবাদ   — মুহিউদ্দীন খান, downloaded once
 *
 * The Arabic text and the English translation are left exactly as they are.
 *
 * Run it on its own (you do NOT need to re-download the Arabic/English text):
 *   bun run add-bangla        # or: node scripts/add-bangla.mjs
 *
 * `bun run fetch-data` calls the same code at the end of a fresh download, so
 * you only ever need one of the two.
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { toBanglaPronunciation } from "../src/bangla-translit.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

/**
 * Bangla translation sources, tried in order. Both are the same translation
 * (মুহিউদ্দীন খান); the second one is the API the rest of this project uses.
 */
const BANGLA_SOURCES = [
  {
    label: "quran-api (GitHub)",
    async load() {
      const url =
        "https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/ben-muhiuddinkhan.json";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const byRef = new Map();
      for (const v of json.quran) byRef.set(`${v.chapter}:${v.verse}`, v.text);
      return byRef;
    },
  },
  {
    label: "Al Quran Cloud API",
    async load() {
      const byRef = new Map();
      for (let n = 1; n <= 114; n++) {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${n}/bn.bengali`
        );
        if (!res.ok) throw new Error(`surah ${n}: HTTP ${res.status}`);
        const json = await res.json();
        for (const ayah of json.data.ayahs) {
          byRef.set(`${n}:${ayah.numberInSurah}`, ayah.text);
        }
        await new Promise((r) => setTimeout(r, 200)); // be polite
      }
      return byRef;
    },
  },
];

async function loadBanglaTranslation() {
  const problems = [];
  for (const source of BANGLA_SOURCES) {
    try {
      process.stdout.write(`  Downloading বাংলা অনুবাদ from ${source.label}...`);
      const byRef = await source.load();
      console.log(` done (${byRef.size} ayahs)`);
      return byRef;
    } catch (err) {
      console.log(` failed (${err.message})`);
      problems.push(`${source.label}: ${err.message}`);
    }
  }
  console.warn(
    `\n  Could not download the Bangla translation:\n    ${problems.join(
      "\n    "
    )}\n  Carrying on with উচ্চারণ only — re-run this script when you are online.`
  );
  return null;
}

/**
 * Adds `pronunciation` (always) and `bangla` (when the download succeeded) to
 * every ayah of `data`, in place. Existing fields are never overwritten by
 * empty values.
 *
 * @param {Record<string, Array<object>>} data  surah number -> ayahs
 * @param {Map<string,string>|null} banglaByRef "surah:ayah" -> Bangla text
 */
export function applyBangla(data, banglaByRef) {
  let pronounced = 0;
  let translated = 0;

  for (const [surahNumber, ayahs] of Object.entries(data)) {
    ayahs.forEach((ayah, i) => {
      const { numberInSurah, arabic, translation, ...rest } = ayah;

      const pronunciation = toBanglaPronunciation(arabic) || rest.pronunciation;
      if (pronunciation) pronounced++;

      const bangla =
        banglaByRef?.get(`${surahNumber}:${numberInSurah}`) ?? rest.bangla;
      if (bangla) translated++;

      delete rest.pronunciation;
      delete rest.bangla;

      // Rebuilt rather than mutated so the JSON reads in the same order the
      // app shows it: Arabic, উচ্চারণ, অনুবাদ, English.
      ayahs[i] = {
        numberInSurah,
        arabic,
        ...(pronunciation ? { pronunciation } : {}),
        ...(bangla ? { bangla } : {}),
        translation,
        ...rest,
      };
    });
  }

  return { pronounced, translated };
}

/** Downloads the Bangla translation and applies both fields to `data`. */
export async function addBangla(data) {
  const banglaByRef = await loadBanglaTranslation();
  return applyBangla(data, banglaByRef);
}

async function main() {
  const targets = ["quran.json", "quran-sample.json"].filter((f) =>
    existsSync(path.join(DATA_DIR, f))
  );

  if (targets.length === 0) {
    console.error(
      `No dataset found in ${DATA_DIR}. Run \`bun run fetch-data\` first.`
    );
    process.exit(1);
  }

  const banglaByRef = await loadBanglaTranslation();

  for (const file of targets) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    const { pronounced, translated } = applyBangla(data, banglaByRef);
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(
      `  ${file}: ${pronounced} ayahs got উচ্চারণ, ${translated} got বাংলা অনুবাদ`
    );
  }

  console.log(
    "\nDone. Re-run `npm run dev` or `npm run build` in frontend/ to pick up the new data."
  );
}

// Only run when executed directly, not when imported by fetch-data.mjs.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("Fatal error while adding Bangla data:", err);
    process.exit(1);
  });
}
