import surahsJson from "@/data/surahs.json";
import quranJson from "@/data/quran.json";
import type { SurahMeta, Ayah } from "./types";

export const surahs: SurahMeta[] = surahsJson as SurahMeta[];

const quranData = quranJson as Record<string, Ayah[]>;

export function getAllSurahs(): SurahMeta[] {
  return surahs;
}

export function getSurah(number: number): SurahMeta | undefined {
  return surahs.find((s) => s.number === number);
}

export function getAyahs(number: number): Ayah[] {
  return quranData[String(number)] ?? [];
}

export function hasAyahData(number: number): boolean {
  return getAyahs(number).length > 0;
}
