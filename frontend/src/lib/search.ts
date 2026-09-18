import type { SurahMeta, Ayah, SearchResult } from "./types";

/**
 * Search helpers shared by the search page.
 *
 * The goal is that *anything* the user might reasonably type finds something:
 *   - English translation text            -> "mercy", "forgiveness"
 *   - Arabic text (with or without harakat) -> "الرحمن", "رحمن"
 *   - Surah names, any spelling           -> "Al-A'raf", "al araf", "alaraf", "الأعراف"
 *   - Surah meaning                       -> "The Heights"
 *   - Surah number                        -> "7"
 *   - Ayah references                     -> "7:31", "7.31", "2:255-257"
 */

// Harakat / tatweel / Quranic annotation marks.
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** Lowercase, strip accents & harakat, unify Arabic letter forms, collapse punctuation to spaces. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(ARABIC_MARKS, "")
    .replace(/[آأإٱ]/g, "ا") // آ أ إ ٱ -> ا
    .replace(/ة/g, "ه") // ة -> ه
    .replace(/ى/g, "ي") // ى -> ي
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Same as normalize() but without any separators, so "alaraf" matches "Al-A'raf". */
export function compact(input: string): string {
  return normalize(input).replace(/ /g, "");
}

export interface IndexedAyah extends SearchResult {
  nTranslation: string;
  cTranslation: string;
  cArabic: string;
}

export interface IndexedSurah {
  meta: SurahMeta;
  cName: string;
  cEnglishName: string;
  cEnglishNameTranslation: string;
}

export interface SearchOutput {
  surahs: SurahMeta[];
  ayahs: SearchResult[];
  /** True when the query was parsed as an ayah reference like "7:31". */
  isReference: boolean;
}

export function buildSurahIndex(surahs: SurahMeta[]): IndexedSurah[] {
  return surahs.map((meta) => ({
    meta,
    cName: compact(meta.name),
    cEnglishName: compact(meta.englishName),
    cEnglishNameTranslation: compact(meta.englishNameTranslation),
  }));
}

export function buildAyahIndex(
  surahs: SurahMeta[],
  getAyahs: (surahNumber: number) => Ayah[]
): IndexedAyah[] {
  const index: IndexedAyah[] = [];
  for (const surah of surahs) {
    for (const ayah of getAyahs(surah.number)) {
      index.push({
        surahNumber: surah.number,
        surahName: surah.name,
        surahEnglishName: surah.englishName,
        numberInSurah: ayah.numberInSurah,
        arabic: ayah.arabic,
        translation: ayah.translation,
        nTranslation: normalize(ayah.translation),
        cTranslation: compact(ayah.translation),
        cArabic: compact(ayah.arabic),
      });
    }
  }
  return index;
}

interface Reference {
  surah: number;
  from: number;
  to: number;
}

/** Parses "7:31", "7.31", "7 31", "2:255-257". Returns null when not a reference. */
export function parseReference(query: string): Reference | null {
  const m = query
    .trim()
    .match(/^(\d{1,3})\s*[:.\-\s]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?$/);
  if (!m) return null;
  const surah = Number(m[1]);
  const from = Number(m[2]);
  const to = m[3] ? Number(m[3]) : from;
  if (surah < 1 || surah > 114 || from < 1 || to < from) return null;
  return { surah, from, to };
}

export function search(
  query: string,
  surahIndex: IndexedSurah[],
  ayahIndex: IndexedAyah[]
): SearchOutput {
  const raw = query.trim();
  if (!raw) return { surahs: [], ayahs: [], isReference: false };

  // 1. Ayah reference — "7:31"
  const ref = parseReference(raw);
  if (ref) {
    const ayahs = ayahIndex.filter(
      (a) =>
        a.surahNumber === ref.surah &&
        a.numberInSurah >= ref.from &&
        a.numberInSurah <= ref.to
    );
    const meta = surahIndex.find((s) => s.meta.number === ref.surah)?.meta;
    return { surahs: meta ? [meta] : [], ayahs, isReference: true };
  }

  const q = compact(raw);
  if (!q) return { surahs: [], ayahs: [], isReference: false };

  // 2. Surahs — by number, English name, Arabic name or meaning
  const asNumber = /^\d{1,3}$/.test(raw) ? Number(raw) : null;
  const surahs = surahIndex
    .filter((s) => {
      if (asNumber !== null) return s.meta.number === asNumber;
      return (
        s.cEnglishName.includes(q) ||
        s.cName.includes(q) ||
        s.cEnglishNameTranslation.includes(q)
      );
    })
    .map((s) => s.meta);

  // 3. Ayahs — translation or Arabic text
  const matchedSurahNumbers = new Set(surahs.map((s) => s.number));
  const ayahs = ayahIndex.filter(
    (a) =>
      a.cTranslation.includes(q) ||
      a.cArabic.includes(q) ||
      // a surah matched by name/number: its ayahs belong in the results too
      matchedSurahNumbers.has(a.surahNumber)
  );

  return { surahs, ayahs, isReference: false };
}
