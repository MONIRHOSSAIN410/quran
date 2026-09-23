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
  /** Arabic text, Uthmani script. */
  arabic: string;
  /**
   * বাংলা উচ্চারণ — how the Arabic is pronounced, written in Bangla script.
   * Generated from the Arabic by backend/src/bangla-translit.mjs; absent until
   * `bun run add-bangla` (or `fetch-data`) has been run.
   */
  pronunciation?: string;
  /** বাংলা অনুবাদ — Bangla translation (মুহিউদ্দীন খান). */
  bangla?: string;
  /** English translation (Sahih International). */
  translation: string;
}

export interface SearchResult extends Ayah {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
}
