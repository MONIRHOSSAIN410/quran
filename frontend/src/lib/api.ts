export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function searchAyahs(query: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) {
    throw new Error(`Search request failed (${res.status})`);
  }
  return res.json() as Promise<{
    data: {
      surahNumber: number;
      surahName: string;
      surahEnglishName: string;
      numberInSurah: number;
      arabic: string;
      translation: string;
    }[];
    query: string;
    count: number;
  }>;
}
