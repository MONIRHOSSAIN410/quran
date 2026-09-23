# Al-Qur'an Web App

A full-stack Qur'an reader: 114 surahs with Arabic text, **বাংলা উচ্চারণ**,
**বাংলা অনুবাদ** and English translation, search, and a settings panel for
fonts and which lines to show — built with Hono (Bun) on the backend and
statically-generated Next.js + Tailwind CSS on the frontend.

## Stack

- **Backend:** Node.js / Hono, run with Bun (`backend/`)
- **Frontend:** Next.js (App Router, static export / SSG) + Tailwind CSS (`frontend/`)
- **Database:** Qur'an text + translations, sourced from the free
  [Al Quran Cloud API](https://alquran.cloud/api) (Arabic: Uthmani script,
  English: Sahih International) and
  [quran-api](https://github.com/fawazahmed0/quran-api) (বাংলা অনুবাদ:
  মুহিউদ্দীন খান). The বাংলা উচ্চারণ is generated offline from the Arabic —
  see below.

## Each ayah shows four lines

| Line | Source |
| --- | --- |
| العربية | Uthmani script, Al Quran Cloud |
| বাংলা উচ্চারণ | generated from the Arabic by `backend/src/bangla-translit.mjs` |
| বাংলা অনুবাদ | মুহিউদ্দীন খান |
| English | Sahih International |

Each of the three lines under the Arabic can be switched on or off
independently in the Settings sidebar; the Arabic is always shown. The choice
is remembered on the device.

## ⚠️ About the bundled data

This project ships with a **small sample dataset** (9 short surahs: Al-Fatihah,
Al-Asr, Al-Fil, Quraysh, Al-Kawthar, An-Nasr, Al-Ikhlas, Al-Falaq, An-Nas) so
everything runs immediately with no setup. **The full 114-surah / 6236-ayah
list and metadata for all surahs is already included** — only the ayah-by-ayah
text for the remaining surahs needs to be downloaded.

To get the **complete** database, run the fetch script once, with internet
access:

```bash
cd backend
bun install          # or: npm install
bun run fetch-data    # downloads all 114 surahs, then adds the Bangla fields
```

This writes `backend/data/quran.json`. The backend API and the frontend build
both automatically prefer this full file over the bundled sample the moment it
exists — no code changes needed. Re-run the script any time; it resumes and
only re-downloads surahs that failed.

If you **already have** `backend/data/quran.json` and only want to add (or
refresh) the two Bangla fields, there is no need to re-download the Arabic and
English text:

```bash
cd backend
bun run add-bangla    # or: node scripts/add-bangla.mjs
```

That regenerates বাংলা উচ্চারণ offline for every ayah and downloads the বাংলা
অনুবাদ. Both scripts leave the existing `arabic` and `translation` fields
untouched.

## How the বাংলা উচ্চারণ is generated

`backend/src/bangla-translit.mjs` converts the vowelled Uthmani Arabic into
Bangla script, letter by letter. It handles short and long vowels, shadda
(gemination), tanween, the aw/ay diphthongs, the definite article including
sun-letter assimilation (ٱلرَّحْمَٰن → আর্রাহ্‌মান), hamzatul wasl, and the
disconnected letters that open 29 surahs (يسٓ → ইয়া সীন, not ইয়্‌স).

**It is a reading aid, not a tajweed engine.** It deliberately does not apply
the rules that depend on what follows — ইখফা, ইক্বলাব, ইদগাম, madd lengths,
ক্বালক্বালা — and several Arabic letters necessarily collapse onto one Bangla
letter because Bangla has no separate sign for them (ث/ص → ছ, ذ/ز/ظ → য,
ت/ط → ত, ك/ق → ক, ح/ه → হ). উচ্চারণ can never replace learning to read the
Arabic script itself, or a qualified teacher.

The mapping lives in one table at the top of that file, so it is easy to adjust
if you prefer a different convention (e.g. ক্ব for ق, or দ্ব for ض). After
editing it, re-run `bun run add-bangla`.

## Project layout

```
quran-app/
├── backend/                 Hono API server
│   ├── data/
│   │   ├── surahs.json      All 114 surahs' metadata (Arabic/English names, ayah counts)
│   │   ├── quran-sample.json  Bundled sample ayah text (9 surahs)
│   │   └── quran.json       Full ayah text — created by `bun run fetch-data`
│   ├── scripts/
│   │   ├── fetch-data.mjs   Downloads Arabic + English, then calls add-bangla
│   │   └── add-bangla.mjs   Adds বাংলা উচ্চারণ (offline) + বাংলা অনুবাদ
│   └── src/
│       ├── bangla-translit.mjs  Arabic -> বাংলা উচ্চারণ converter
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
- **Ayat page** — every ayah with Arabic text, বাংলা উচ্চারণ, বাংলা অনুবাদ and
  English translation, prev/next surah navigation.
- **Search** — search ayahs by বাংলা অনুবাদ, বাংলা উচ্চারণ, English translation
  or Arabic text, with match highlighting and a deep link back to the ayah in
  context. Bangla matching ignores matras and হসন্ত, so typing "রহমান" still
  finds "রাহ্‌মান".
- **Settings sidebar** — show/hide each of the three lines under the Arabic;
  choose between 3 Arabic fonts (Amiri, Scheherazade New, Noto Naskh Arabic);
  adjust Arabic, Bangla and English font sizes independently; all persisted to
  `localStorage` and restored on your next visit.

## Notes / known limitations

- The বাংলা উচ্চারণ is generated, not hand-checked — see the section above for
  what it does and does not do.
- The Search page imports the whole dataset so it can run client-side with no
  backend. With all four lines that is a ~1.6 MB first load for `/search`
  (other pages are unaffected, ~97 kB). If that matters for your deployment,
  the fix is to build a trimmed search index at build time rather than
  importing `quran.json` directly.
- Only 9 short surahs ship with real ayah text out of the box; run
  `bun run fetch-data` for the complete Qur'an.
