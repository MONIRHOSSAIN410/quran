"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllSurahs, getAyahs } from "@/lib/quran";
import { useSettings } from "./SettingsProvider";
import {
  buildAyahIndex,
  buildSurahIndex,
  compact,
  search,
} from "@/lib/search";

const PAGE_SIZE = 50;

/**
 * Compacts text the same way the search does, while keeping a map back to the
 * original character offsets — so a match on "alaraf" can still be highlighted
 * inside "Al-A'raf", and a match on "রহমান" inside "রাহ্‌মান".
 */
function compactWithMap(text: string) {
  let out = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const piece = compact(text[i]);
    for (const ch of piece) {
      out += ch;
      map.push(i);
    }
  }
  return { out, map };
}

function highlight(text: string, query: string) {
  const q = compact(query);
  if (!q) return text;
  const { out, map } = compactWithMap(text);
  const idx = out.indexOf(q);
  if (idx === -1) return text;
  const start = map[idx];
  const end = map[idx + q.length - 1] + 1;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-brand-200 px-0.5 text-brand-900 dark:bg-brand-700 dark:text-brand-50">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { translationFontSize, banglaFontSize, isLineVisible } = useSettings();

  const surahIndex = useMemo(() => buildSurahIndex(getAllSurahs()), []);
  const ayahIndex = useMemo(
    () => buildAyahIndex(getAllSurahs(), getAyahs),
    []
  );

  const { surahs, ayahs, isReference } = useMemo(
    () => search(query, surahIndex, ayahIndex),
    [query, surahIndex, ayahIndex]
  );

  useEffect(() => setVisible(PAGE_SIZE), [query]);

  const hasQuery = query.trim().length > 0;
  const shown = ayahs.slice(0, visible);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-brand-900 dark:text-brand-50 sm:text-3xl">
        Search
      </h1>
      <p className="mb-6 text-brand-500">
        Search the whole Qur&rsquo;an — বাংলা অনুবাদ, বাংলা উচ্চারণ, English
        translation, Arabic text, surah names, or a reference like{" "}
        <code>7:31</code>.
      </p>

      <div className="relative mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. করুণাময়, রাহমান, mercy, Al-A'raf, الرحمن, 2:255"
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 outline-none ring-brand-400 focus:ring-2 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-50"
          autoFocus
        />
      </div>

      {hasQuery && (
        <p className="mb-4 text-sm text-brand-400">
          {surahs.length > 0 && (
            <>
              {surahs.length} surah{surahs.length === 1 ? "" : "s"}
              {" · "}
            </>
          )}
          {ayahs.length} ayah{ayahs.length === 1 ? "" : "s"} for &ldquo;
          {query.trim()}&rdquo;
          {ayahs.length > shown.length
            ? ` (showing first ${shown.length})`
            : ""}
        </p>
      )}

      {surahs.length > 0 && !isReference && (
        <ul className="mb-6 grid gap-3 sm:grid-cols-2">
          {surahs.map((s) => (
            <li key={s.number}>
              <Link
                href={`/surah/${s.number}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white p-4 transition hover:border-brand-300 dark:border-brand-900 dark:bg-brand-950 dark:hover:border-brand-700"
              >
                <span>
                  <span className="block font-semibold text-brand-900 dark:text-brand-50">
                    {s.number}. {highlight(s.englishName, query)}
                  </span>
                  <span className="block text-sm text-brand-500">
                    {s.englishNameTranslation} · {s.numberOfAyahs} ayahs ·{" "}
                    {s.revelationType}
                  </span>
                </span>
                <span className="shrink-0 text-lg text-brand-700 dark:text-brand-200">
                  {s.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="space-y-4">
        {shown.map((r) => (
          <li
            key={`${r.surahNumber}-${r.numberInSurah}`}
            className="rounded-xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-brand-950"
          >
            <Link
              href={`/surah/${r.surahNumber}#ayah-${r.numberInSurah}`}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
            >
              {r.surahEnglishName} ({r.surahNumber}:{r.numberInSurah})
            </Link>
            <p className="mb-2 text-right text-xl leading-loose text-brand-900 dark:text-brand-50">
              {r.arabic}
            </p>

            {r.pronunciation && isLineVisible("pronunciation") && (
              <p
                lang="bn"
                className="bangla-text mb-2 border-l-2 border-brand-200 pl-3 italic text-brand-600 dark:border-brand-800 dark:text-brand-300"
                style={{ fontSize: `${banglaFontSize}px` }}
              >
                {highlight(r.pronunciation, query)}
              </p>
            )}

            {r.bangla && isLineVisible("bangla") && (
              <p
                lang="bn"
                className="bangla-text mb-2 text-brand-800 dark:text-brand-100"
                style={{ fontSize: `${banglaFontSize}px` }}
              >
                {highlight(r.bangla, query)}
              </p>
            )}

            {isLineVisible("translation") && (
              <p
                style={{ fontSize: `${translationFontSize}px` }}
                className="leading-relaxed text-brand-700 dark:text-brand-200"
              >
                {highlight(r.translation, query)}
              </p>
            )}
          </li>
        ))}
      </ul>

      {ayahs.length > shown.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-6 w-full rounded-xl border border-brand-200 px-4 py-3 font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-800 dark:text-brand-200 dark:hover:bg-brand-900"
        >
          Show {Math.min(PAGE_SIZE, ayahs.length - shown.length)} more of{" "}
          {ayahs.length - shown.length} remaining
        </button>
      )}

      {hasQuery && ayahs.length === 0 && surahs.length === 0 && (
        <p className="rounded-xl border border-dashed border-brand-200 p-8 text-center text-brand-400 dark:border-brand-800">
          No matches for &ldquo;{query.trim()}&rdquo;. Try a Bangla word, an
          English word, an Arabic word, a surah name, or a reference like{" "}
          <code>7:31</code>.
        </p>
      )}
    </div>
  );
}
