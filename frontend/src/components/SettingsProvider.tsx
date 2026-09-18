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

interface Settings {
  arabicFont: ArabicFontKey;
  arabicFontSize: number; // px
  translationFontSize: number; // px
}

const DEFAULT_SETTINGS: Settings = {
  arabicFont: "amiri",
  arabicFontSize: 32,
  translationFontSize: 16,
};

const LIMITS = {
  arabicFontSize: { min: 20, max: 56, step: 2 },
  translationFontSize: { min: 12, max: 28, step: 1 },
};

const STORAGE_KEY = "quran-app:settings";

interface SettingsContextValue extends Settings {
  setArabicFont: (font: ArabicFontKey) => void;
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  resetSettings: () => void;
  limits: typeof LIMITS;
  arabicFontClassName: string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

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
    setSettings((s) => ({
      ...s,
      arabicFontSize: Math.min(
        LIMITS.arabicFontSize.max,
        Math.max(LIMITS.arabicFontSize.min, size)
      ),
    }));
  }, []);

  const setTranslationFontSize = useCallback((size: number) => {
    setSettings((s) => ({
      ...s,
      translationFontSize: Math.min(
        LIMITS.translationFontSize.max,
        Math.max(LIMITS.translationFontSize.min, size)
      ),
    }));
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
