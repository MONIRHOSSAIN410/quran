import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import {
  surahs,
  getSurahMeta,
  getAyahs,
  searchAyahs,
  isFullDatasetLoaded,
} from "./data";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) =>
  c.json({
    name: "Quran API",
    fullDatasetLoaded: isFullDatasetLoaded,
    endpoints: [
      "GET /api/surahs",
      "GET /api/surahs/:number",
      "GET /api/search?q=<text>",
    ],
  })
);

// All 114 surahs (Arabic + English names, ayah counts, revelation type).
app.get("/api/surahs", (c) => {
  return c.json({ data: surahs, fullDatasetLoaded: isFullDatasetLoaded });
});

// A single surah with all of its ayahs (Arabic text + English translation).
app.get("/api/surahs/:number", (c) => {
  const number = Number(c.req.param("number"));
  if (!Number.isInteger(number) || number < 1 || number > 114) {
    return c.json({ error: "Surah number must be between 1 and 114." }, 400);
  }

  const meta = getSurahMeta(number);
  if (!meta) {
    return c.json({ error: "Surah not found." }, 404);
  }

  const ayahs = getAyahs(number);

  return c.json({
    data: {
      ...meta,
      ayahs: ayahs ?? [],
    },
    dataAvailable: Boolean(ayahs && ayahs.length > 0),
  });
});

// Search ayahs by translation text, e.g. /api/search?q=mercy
app.get("/api/search", (c) => {
  const q = c.req.query("q") ?? "";
  if (!q.trim()) {
    return c.json({ data: [], query: q });
  }
  const results = searchAyahs(q);
  return c.json({ data: results, query: q, count: results.length });
});

const port = Number(process.env.PORT) || 3001;

console.log(`Quran API listening on http://localhost:${port}`);
if (!isFullDatasetLoaded) {
  console.log(
    "Only sample data is loaded. Run `bun run fetch-data` (needs internet access) to download the full 114-surah database."
  );
}

serve({ fetch: app.fetch, port });

export default app;
