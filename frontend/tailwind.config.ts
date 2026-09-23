import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        amiri: ["var(--font-amiri)", "serif"],
        scheherazade: ["var(--font-scheherazade)", "serif"],
        notoNaskh: ["var(--font-noto-naskh)", "serif"],
        bengali: ["var(--font-noto-bengali)", "Noto Sans Bengali", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f2f9f6",
          100: "#dcefe4",
          200: "#b9dfc9",
          300: "#8bc9a9",
          400: "#5cae86",
          500: "#39936a",
          600: "#297654",
          700: "#215e44",
          800: "#1c4b38",
          900: "#183e2f",
          950: "#0b2319",
        },
      },
    },
  },
  plugins: [],
};

export default config;
