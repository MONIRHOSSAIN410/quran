import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl font-bold text-brand-900 dark:text-brand-50">
        Not found
      </h1>
      <p className="mt-2 text-brand-500">
        That surah doesn&apos;t exist. There are 114 surahs in total.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to Surah list
      </Link>
    </div>
  );
}
