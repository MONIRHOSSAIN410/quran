import Link from "next/link";
import type { SurahMeta } from "@/lib/types";

export default function SurahListItem({ surah }: { surah: SurahMeta }) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      className="group flex items-center gap-4 rounded-xl border border-brand-100 bg-white px-4 py-3.5 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-brand-900 dark:bg-brand-950 dark:hover:bg-brand-900"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200 text-sm font-semibold text-brand-700 group-hover:border-brand-400 group-hover:bg-white dark:border-brand-700 dark:text-brand-200">
        {surah.number}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-brand-900 dark:text-brand-50">
          {surah.englishName}
        </span>
        <span className="block truncate text-sm text-brand-400">
          {surah.englishNameTranslation} &middot; {surah.revelationType} &middot;{" "}
          {surah.numberOfAyahs} Ayahs
        </span>
      </span>

      <span className="arabic-text shrink-0 font-amiri text-2xl text-brand-800 dark:text-brand-100">
        {surah.name}
      </span>
    </Link>
  );
}
