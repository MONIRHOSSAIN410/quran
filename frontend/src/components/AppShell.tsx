"use client";

import { useState, type ReactNode } from "react";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";
import { SettingsProvider } from "./SettingsProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <SettingsProvider>
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onToggleSettings={() => setSettingsOpen((v) => !v)} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-brand-100 px-4 py-6 text-center text-xs text-brand-400 dark:border-brand-900">
            Built with Next.js &amp; Tailwind CSS. Ayah data via the bundled API.
          </footer>
        </div>
        <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </SettingsProvider>
  );
}
