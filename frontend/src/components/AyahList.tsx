"use client";

import type { Ayah } from "@/lib/types";
import { useSettings } from "./SettingsProvider";

export default function AyahList({
  surahNumber,
  ayahs,
}: {
  surahNumber: number;
  ayahs: Ayah[];
}) {
  const { arabicFontSize, translationFontSize, arabicFontClassName } =
    useSettings();

  return (
    <ol className="space-y-6">
      {ayahs.map((ayah) => (
        <li
          key={ayah.numberInSurah}
          id={`ayah-${ayah.numberInSurah}`}
          className="scroll-mt-24 rounded-xl border border-brand-100 bg-white p-5 dark:border-brand-900 dark:bg-brand-950"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
              {ayah.numberInSurah}
            </span>
            <span className="text-xs text-brand-400">
              {surahNumber}:{ayah.numberInSurah}
            </span>
          </div>

          <p
            dir="rtl"
            className={`arabic-text mb-4 ${arabicFontClassName}`}
            style={{ fontSize: `${arabicFontSize}px` }}
          >
            {ayah.arabic}
          </p>

          <p
            className="leading-relaxed text-brand-700 dark:text-brand-200"
            style={{ fontSize: `${translationFontSize}px` }}
          >
            {ayah.translation}
          </p>
        </li>
      ))}
    </ol>
  );
}
