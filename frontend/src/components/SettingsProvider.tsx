"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ArabicFontKey = "amiri" | "scheherazade" | "notoNaskh";

export const ARABIC_FONTS: { key: ArabicFontKey; label: string; className: string }[] = [
  { key: "amiri", label: "Amiri", className: "font-amiri" },
  { key: "scheherazade", label: "Scheherazade New", className: "font-scheherazade" },
  { key: "notoNaskh", label: "Noto Naskh Arabic", className: "font-notoNaskh" },
];

/** The lines that can be shown under the Arabic, in the order they appear. */
export type LineKey = "pronunciation" | "bangla" | "translation";

export const LINES: { key: LineKey; label: string; hint: string }[] = [
  { key: "pronunciation", label: "বাংলা উচ্চারণ", hint: "Bangla pronunciation" },
  { key: "bangla", label: "বাংলা অনুবাদ", hint: "Bangla translation" },
  { key: "translation", label: "English", hint: "Sahih International" },
];

interface Settings {
  arabicFont: ArabicFontKey;
  arabicFontSize: number; // px
  translationFontSize: number; // px, English
  banglaFontSize: number; // px, উচ্চারণ + অনুবাদ
  showPronunciation: boolean;
  showBangla: boolean;
  showTranslation: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  arabicFont: "amiri",
  arabicFontSize: 32,
  translationFontSize: 16,
  banglaFontSize: 17,
  showPronunciation: true,
  showBangla: true,
  showTranslation: true,
};

const LIMITS = {
  arabicFontSize: { min: 20, max: 56, step: 2 },
  translationFontSize: { min: 12, max: 28, step: 1 },
  banglaFontSize: { min: 12, max: 30, step: 1 },
};

const STORAGE_KEY = "quran-app:settings";

const VISIBILITY_KEY: Record<LineKey, keyof Settings> = {
  pronunciation: "showPronunciation",
  bangla: "showBangla",
  translation: "showTranslation",
};

interface SettingsContextValue extends Settings {
  setArabicFont: (font: ArabicFontKey) => void;
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setBanglaFontSize: (size: number) => void;
  isLineVisible: (line: LineKey) => boolean;
  toggleLine: (line: LineKey) => void;
  resetSettings: () => void;
  limits: typeof LIMITS;
  arabicFontClassName: string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function clamp(value: number, key: keyof typeof LIMITS) {
  return Math.min(LIMITS[key].max, Math.max(LIMITS[key].min, value));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted settings once, on mount, in the browser only.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // localStorage unavailable or corrupted value — fall back to defaults.
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist on every change (after the initial load).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore write failures (private browsing, storage full, etc).
    }
  }, [settings, hydrated]);

  const setArabicFont = useCallback((font: ArabicFontKey) => {
    setSettings((s) => ({ ...s, arabicFont: font }));
  }, []);

  const setArabicFontSize = useCallback((size: number) => {
    setSettings((s) => ({ ...s, arabicFontSize: clamp(size, "arabicFontSize") }));
  }, []);

  const setTranslationFontSize = useCallback((size: number) => {
    setSettings((s) => ({
      ...s,
      translationFontSize: clamp(size, "translationFontSize"),
    }));
  }, []);

  const setBanglaFontSize = useCallback((size: number) => {
    setSettings((s) => ({ ...s, banglaFontSize: clamp(size, "banglaFontSize") }));
  }, []);

  const isLineVisible = useCallback(
    (line: LineKey) => Boolean(settings[VISIBILITY_KEY[line]]),
    [settings]
  );

  const toggleLine = useCallback((line: LineKey) => {
    const key = VISIBILITY_KEY[line];
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const arabicFontClassName =
    ARABIC_FONTS.find((f) => f.key === settings.arabicFont)?.className ??
    "font-amiri";

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setArabicFont,
        setArabicFontSize,
        setTranslationFontSize,
        setBanglaFontSize,
        isLineVisible,
        toggleLine,
        resetSettings,
        limits: LIMITS,
        arabicFontClassName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
