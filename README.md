# Al-Qur'an Web App

A full-stack Qur'an reader: 114 surahs with Arabic text and English translation,
search, and a settings panel for fonts — built with Hono (Bun) on the backend
and statically-generated Next.js + Tailwind CSS on the frontend.

## Stack

- **Backend:** Node.js / Hono, run with Bun (`backend/`)
- **Frontend:** Next.js (App Router, static export / SSG) + Tailwind CSS (`frontend/`)
- **Database:** Qur'an text + English translation, sourced from the free
  [Al Quran Cloud API](https://alquran.cloud/api) (Arabic: Uthmani script,
  translation: Sahih International)

## ⚠️ About the bundled data

This project ships with a **small sample dataset** (9 short surahs: Al-Fatihah,
Al-Asr, Al-Fil, Quraysh, Al-Kawthar, An-Nasr, Al-Ikhlas, Al-Falaq, An-Nas) so
everything runs immediately with no setup. **The full 114-surah / 6236-ayah
list and metadata for all surahs is already included** — only the ayah-by-ayah
Arabic + translation text for the remaining surahs needs to be downloaded.

To get the **complete** database, run the fetch script once, with internet
access:

```bash
cd backend
bun install          # or: npm install
bun run fetch-data    # downloads all 114 surahs from api.alquran.cloud
```

This writes `backend/data/quran.json`. The backend API and the frontend build
both automatically prefer this full file over the bundled sample the moment it
exists — no code changes needed. Re-run the script any time; it resumes and
only re-downloads surahs that failed.

## Project layout

```
quran-app/
├── backend/                 Hono API server
│   ├── data/
│   │   ├── surahs.json      All 114 surahs' metadata (Arabic/English names, ayah counts)
│   │   ├── quran-sample.json  Bundled sample ayah text (9 surahs)
│   │   └── quran.json       Full ayah text — created by `bun run fetch-data`
│   ├── scripts/fetch-data.mjs
│   └── src/
│       ├── data.ts          Data loading/merging + search logic
│       └── index.ts         Hono app: /api/surahs, /api/surahs/:number, /api/search
└── frontend/                 Next.js app (static export)
    ├── scripts/sync-data.mjs  Copies backend/data into src/data before dev/build
    └── src/
        ├── app/
        │   ├── page.tsx              Surah list (SSG)
        │   ├── surah/[number]/page.tsx  Ayat page (SSG, generateStaticParams for all 114)
        │   └── search/page.tsx       Search page
        ├── components/
        │   ├── AppShell.tsx, Header.tsx, SettingsSidebar.tsx, SettingsProvider.tsx
        │   ├── SurahListItem.tsx, AyahList.tsx, SearchClient.tsx
        └── lib/                      Typed data accessors
```

## Setup & run (development)

You need [Bun](https://bun.sh) for the backend (or adapt the scripts to plain
Node — the backend code itself only uses Node-compatible APIs) and Node.js
18+ for the frontend.

**1. Backend**

```bash
cd backend
bun install
bun run fetch-data   # optional but recommended — see note above
bun run dev           # http://localhost:3001
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install           # or: bun install / pnpm install
cp .env.example .env.local   # points the Search page at the backend, if you use it
npm run dev            # http://localhost:3000
```

The `predev`/`prebuild` scripts automatically copy the latest data from
`backend/data` into `frontend/src/data` every time, so the two stay in sync —
just re-run `npm run dev` / `npm run build` after fetching new data.

## Building the static site (SSG)

```bash
cd frontend
npm run build   # runs sync-data, then `next build` (output: 'export')
```

This produces a fully static site in `frontend/out/` — every surah page
(1 through 114) is pre-rendered at build time. You can deploy `out/` to any
static host (Vercel, Netlify, GitHub Pages, S3, etc). The Search page runs
entirely client-side against the data bundled at build time, so the static
site is fully self-contained and does **not** require the backend to be
running in production.

The backend (`bun run start` in `backend/`) is a standalone REST API
(`/api/surahs`, `/api/surahs/:number`, `/api/search`) you can deploy
separately if you want other clients to consume the same data.

## Features

- **Responsive UI** — usable from a phone up to a wide desktop screen.
- **Surah List** — all 114 surahs with Arabic and English names, ayah counts,
  and Meccan/Medinan classification.
- **Ayat page** — every ayah of the selected surah with Arabic text and
  English translation, prev/next surah navigation.
- **Search** — search ayahs by translation text, with match highlighting and
  a deep link back to the ayah in context.
- **Settings sidebar** — choose between 3 Arabic fonts (Amiri, Scheherazade
  New, Noto Naskh Arabic), adjust Arabic and translation font sizes
  independently; all persisted to `localStorage` and restored on your next
  visit.

## Notes / known limitations

- This project's code was generated in a network-restricted sandbox that
  could not run `npm install` or `next build`, so the app could not be
  built/run end-to-end before delivery. The code was written carefully
  against standard Next.js App Router / Hono / Tailwind conventions and
  syntax-checked with `tsc`, but please run `npm run dev` / `bun run dev`
  yourself and report anything that needs fixing.
- Only 9 short surahs ship with real ayah text out of the box; run
  `bun run fetch-data` for the complete Qur'an.
