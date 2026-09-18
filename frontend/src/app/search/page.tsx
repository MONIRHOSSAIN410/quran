import type { Metadata } from "next";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search — Al-Qur'an",
};

export default function SearchPage() {
  return <SearchClient />;
}
