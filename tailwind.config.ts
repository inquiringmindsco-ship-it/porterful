import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "pf-bg": "var(--pf-bg)",
        "pf-bg-secondary": "var(--pf-bg-secondary)",
        "pf-surface": "var(--pf-surface)",
        "pf-surface-hover": "var(--pf-surface-hover)",
        "pf-border": "var(--pf-border)",
        "pf-border-subtle": "var(--pf-border-subtle)",
        "pf-text": "var(--pf-text)",
        "pf-text-secondary": "var(--pf-text-secondary)",
        "pf-text-muted": "var(--pf-text-muted)",
        "pf-orange": "var(--pf-orange)",
        "pf-orange-dark": "var(--pf-orange-dark)",
        "pf-purple": "var(--pf-purple)",
      },
    },
  },
  plugins: [],
};
export default config;
