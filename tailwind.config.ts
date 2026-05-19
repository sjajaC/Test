import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        smoke: "#475569",
        ember: "#f97316",
        ash: "#e2e8f0",
      },
    },
  },
  plugins: [],
};

export default config;
