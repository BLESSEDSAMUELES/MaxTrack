/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          dark: "#080c14",
          card: "#0f172a",
          cardHover: "#1e293b",
          border: "#1e293b",
          borderHighlight: "#334155"
        },
        eng: {
          DEFAULT: "#0284c7",
          light: "#38bdf8",
          dark: "#0369a1",
          bg: "rgba(2, 132, 199, 0.15)"
        },
        snt: {
          DEFAULT: "#059669",
          light: "#34d399",
          dark: "#047857",
          bg: "rgba(5, 150, 105, 0.15)"
        },
        trd: {
          DEFAULT: "#d97706",
          light: "#fbbf24",
          dark: "#b45309",
          bg: "rgba(217, 119, 6, 0.15)"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
