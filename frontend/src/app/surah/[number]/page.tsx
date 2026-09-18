import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSurahs, getSurah, getAyahs } from "@/lib/quran";
import AyahList from "@/components/AyahList";

export function generateStaticParams() {
  return getAllSurahs().map((surah) => ({ number: String(surah.number) }));
}

export function generateMetadata({
  params,
}: {
  params: { number: string };
}) {
  const surah = getSurah(Number(params.number));
  if (!surah) return {};
  return {
    title: `${surah.englishName} (${surah.name}) — Al-Qur'an`,
    description: `Surah ${surah.englishName}, "${surah.englishNameTranslation}" — ${surah.numberOfAyahs} ayahs.`,
  };
}

export default function SurahPage({
  params,
}: {
  params: { number: string };
}) {
  const number = Number(params.number);
  const surah = getSurah(number);
  if (!surah) notFound();

  const ayahs = getAyahs(number);
  const allSurahs = getAllSurahs();
  const prev = allSurahs.find((s) => s.number === number - 1);
  const next = allSurahs.find((s) => s.number === number + 1);

  return (
    <div>
      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50 p-5 text-center dark:border-brand-900 dark:bg-brand-900/40 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-500">
          Surah {surah.number}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-brand-900 dark:text-brand-50 sm:text-3xl">
          {surah.englishName}{" "}
          <span className="font-normal text-brand-500">
            ({surah.englishNameTranslation})
          </span>
        </h1>
        <p dir="rtl" className="arabic-text font-amiri mt-2 text-3xl text-brand-800 dark:text-brand-100">
          {surah.name}
        </p>
        <p className="mt-2 text-sm text-brand-500">
          {surah.revelationType} &middot; {surah.numberOfAyahs} Ayahs
        </p>
      </div>

      {ayahs.length > 0 ? (
        <AyahList surahNumber={surah.number} ayahs={ayahs} />
      ) : (
        <div className="rounded-xl border border-dashed border-brand-200 bg-white p-8 text-center dark:border-brand-800 dark:bg-brand-950">
          <p className="font-medium text-brand-700 dark:text-brand-200">
            This surah&apos;s text hasn&apos;t been downloaded yet.
          </p>
          <p className="mt-2 text-sm text-brand-500">
            Run <code className="rounded bg-brand-100 px-1.5 py-0.5 dark:bg-brand-900">bun run fetch-data</code> in
            the <code className="rounded bg-brand-100 px-1.5 py-0.5 dark:bg-brand-900">backend</code> folder to
            download the complete Qur&apos;an database, then rebuild the site.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {prev ? (
          <Link
            href={`/surah/${prev.number}`}
            className="flex-1 rounded-lg border border-brand-100 px-4 py-3 text-sm text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            ← {prev.englishName}
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/surah/${next.number}`}
            className="flex-1 rounded-lg border border-brand-100 px-4 py-3 text-right text-sm text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            {next.englishName} →
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>
    </div>
  );
}
