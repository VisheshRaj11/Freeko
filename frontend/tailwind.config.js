/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        green:   "#39FF14",
        bg:      "#080808",
        surface: "#111111",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body:    ["'Space Grotesk'",    "sans-serif"],
      },
    },
  },
  plugins: [],
}