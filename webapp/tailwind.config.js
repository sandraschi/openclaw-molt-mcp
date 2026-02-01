/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0a0a0c",
          secondary: "#0f0f12",
          tertiary: "#16161a",
        },
        foreground: {
          DEFAULT: "#fafafa",
          secondary: "#a1a1aa",
          tertiary: "#71717a",
        },
        border: {
          DEFAULT: "#27272a",
          secondary: "#3f3f46",
          accent: "#f97316",
        },
        card: {
          DEFAULT: "#0f0f12",
          secondary: "#16161a",
          accent: "#27272a",
        },
        primary: {
          DEFAULT: "#f97316",
          foreground: "#0a0a0c",
        },
        accent: {
          DEFAULT: "#f97316",
          foreground: "#0a0a0c",
        },
        muted: {
          DEFAULT: "#27272a",
          foreground: "#a1a1aa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(249, 115, 22, 0.25)",
        "glow-sm": "0 0 10px rgba(249, 115, 22, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
