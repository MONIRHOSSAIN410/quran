import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
}

export interface Ayah {
  numberInSurah: number;
  arabic: string;
  /** বাংলা উচ্চারণ — Bangla pronunciation of the Arabic. */
  pronunciation?: string;
  /** বাংলা অনুবাদ — Bangla translation (মুহিউদ্দীন খান). */
  bangla?: string;
  /** English translation (Sahih International). */
  translation: string;
}

type QuranData = Record<string, Ayah[]>;

function loadJson<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch (err) {
    console.error(`Failed to parse ${filename}:`, err);
    return null;
  }
}

export const surahs: SurahMeta[] = loadJson<SurahMeta[]>("surahs.json") ?? [];

// Prefer the full dataset (backend/data/quran.json) produced by `bun run fetch-data`.
// Fall back to the small bundled sample so the app still runs out of the box.
const fullData = loadJson<QuranData>("quran.json");
const sampleData = loadJson<QuranData>("quran-sample.json") ?? {};
export const quranData: QuranData = fullData
  ? { ...sampleData, ...fullData }
  : sampleData;

export const isFullDatasetLoaded = Boolean(fullData);

/** True once `bun run add-bangla` (or `fetch-data`) has filled in the Bangla fields. */
export const isBanglaDataLoaded = Object.values(quranData).some((ayahs) =>
  ayahs.some((a) => Boolean(a.pronunciation))
);

export function getSurahMeta(number: number): SurahMeta | undefined {
  return surahs.find((s) => s.number === number);
}

export function getAyahs(number: number): Ayah[] | undefined {
  return quranData[String(number)];
}

export interface AyahSearchResult extends Ayah {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
}

/**
 * Searches the English translation, the বাংলা অনুবাদ and the বাংলা উচ্চারণ,
 * so "mercy", "করুণাময়" and "রাহমান" all find something.
 */
export function searchAyahs(query: string): AyahSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: AyahSearchResult[] = [];

  for (const [surahNumberStr, ayahs] of Object.entries(quranData)) {
    const surahNumber = Number(surahNumberStr);
    const meta = getSurahMeta(surahNumber);
    for (const ayah of ayahs) {
      const haystacks = [ayah.translation, ayah.bangla, ayah.pronunciation];
      if (haystacks.some((text) => text?.toLowerCase().includes(q))) {
        results.push({
          ...ayah,
          surahNumber,
          surahName: meta?.name ?? "",
          surahEnglishName: meta?.englishName ?? "",
        });
      }
    }
  }

  return results.sort(
    (a, b) => a.surahNumber - b.surahNumber || a.numberInSurah - b.numberInSurah
  );
}
