"use client";

import Link from "next/link";

export default function Header({
  onToggleSettings,
}: {
  onToggleSettings: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur dark:border-brand-900 dark:bg-brand-950/90">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
            ق
          </span>
          <span className="text-lg font-semibold text-brand-900 dark:text-brand-50">
            Al-Qur&apos;an
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            Surahs
          </Link>
          <Link
            href="/search"
            className="rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            Search
          </Link>
          <button
            onClick={onToggleSettings}
            aria-label="Open settings"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
