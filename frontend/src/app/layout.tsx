import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Amiri, Scheherazade_New, Noto_Naskh_Arabic } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});
const scheherazade = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-scheherazade",
});
const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-noto-naskh",
});

export const metadata: Metadata = {
  title: "Al-Qur'an",
  description:
    "Read all 114 surahs of the Qur'an with Arabic text and English translation.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${amiri.variable} ${scheherazade.variable} ${notoNaskh.variable} bg-white font-sans text-brand-950 antialiased dark:bg-brand-950 dark:text-brand-50`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
