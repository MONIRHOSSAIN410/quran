import { getAllSurahs } from "@/lib/quran";
import SurahListItem from "@/components/SurahListItem";

export default function HomePage() {
  const surahs = getAllSurahs();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-50 sm:text-3xl">
          The Holy Qur&apos;an
        </h1>
        <p className="mt-1 text-brand-500">
          All {surahs.length} surahs, with Arabic text and English translation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {surahs.map((surah) => (
          <SurahListItem key={surah.number} surah={surah} />
        ))}
      </div>
    </div>
  );
}
