"use client";

import { ARABIC_FONTS, LINES, useSettings } from "./SettingsProvider";

export default function SettingsSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    arabicFont,
    arabicFontSize,
    translationFontSize,
    banglaFontSize,
    setArabicFont,
    setArabicFontSize,
    setTranslationFontSize,
    setBanglaFontSize,
    isLineVisible,
    toggleLine,
    resetSettings,
    limits,
  } = useSettings();

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Settings"
        className={`fixed right-0 top-0 z-50 h-dvh w-80 max-w-[85vw] transform overflow-y-auto border-l border-brand-100 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:border-brand-900 dark:bg-brand-950 lg:sticky lg:top-0 lg:z-0 lg:h-dvh lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4 dark:border-brand-900">
          <h2 className="text-lg font-semibold text-brand-900 dark:text-brand-50">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-900 lg:hidden"
            aria-label="Close settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-8 px-5 py-6">
          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Show under the Arabic
            </h3>
            <p className="mb-3 text-xs text-brand-400">
              The Arabic text is always shown.
            </p>
            <div className="space-y-2">
              {LINES.map((line) => (
                <label
                  key={line.key}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    isLineVisible(line.key)
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900"
                      : "border-brand-100 hover:border-brand-300 dark:border-brand-800"
                  }`}
                >
                  <span>
                    <span className="bangla-text block text-sm text-brand-900 dark:text-brand-50">
                      {line.label}
                    </span>
                    <span className="block text-xs text-brand-400">
                      {line.hint}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={isLineVisible(line.key)}
                    onChange={() => toggleLine(line.key)}
                    className="h-4 w-4 shrink-0 accent-brand-600"
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Arabic Font
            </h3>
            <div className="space-y-2">
              {ARABIC_FONTS.map((f) => (
                <label
                  key={f.key}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                    arabicFont === f.key
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900"
                      : "border-brand-100 hover:border-brand-300 dark:border-brand-800"
                  }`}
                >
                  <span className="text-sm text-brand-900 dark:text-brand-50">
                    {f.label}
                  </span>
                  <input
                    type="radio"
                    name="arabic-font"
                    value={f.key}
                    checked={arabicFont === f.key}
                    onChange={() => setArabicFont(f.key)}
                    className="h-4 w-4 accent-brand-600"
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                Arabic Font Size
              </h3>
              <span className="text-sm tabular-nums text-brand-500">
                {arabicFontSize}px
              </span>
            </div>
            <input
              type="range"
              min={limits.arabicFontSize.min}
              max={limits.arabicFontSize.max}
              step={limits.arabicFontSize.step}
              value={arabicFontSize}
              onChange={(e) => setArabicFontSize(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                Bangla Font Size
              </h3>
              <span className="text-sm tabular-nums text-brand-500">
                {banglaFontSize}px
              </span>
            </div>
            <input
              type="range"
              min={limits.banglaFontSize.min}
              max={limits.banglaFontSize.max}
              step={limits.banglaFontSize.step}
              value={banglaFontSize}
              onChange={(e) => setBanglaFontSize(Number(e.target.value))}
              className="w-full accent-brand-600"
              aria-label="Bangla font size"
            />
            <p className="bangla-text mt-2 text-brand-400" style={{ fontSize: `${banglaFontSize}px` }}>
              বিস্‌মিল্লাহির রাহ্‌মানির রাহীম
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                English Font Size
              </h3>
              <span className="text-sm tabular-nums text-brand-500">
                {translationFontSize}px
              </span>
            </div>
            <input
              type="range"
              min={limits.translationFontSize.min}
              max={limits.translationFontSize.max}
              step={limits.translationFontSize.step}
              value={translationFontSize}
              onChange={(e) => setTranslationFontSize(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </section>

          <button
            onClick={resetSettings}
            className="w-full rounded-lg border border-brand-200 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            Reset to defaults
          </button>

          <p className="text-xs leading-relaxed text-brand-400">
            Your preferences are saved on this device and applied automatically
            next time you visit.
          </p>
        </div>
      </aside>
    </>
  );
}
