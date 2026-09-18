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
  translation: string;
}

export interface SearchResult {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  numberInSurah: number;
  arabic: string;
  translation: string;
}
