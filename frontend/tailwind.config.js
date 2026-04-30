/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent:  "#C6F135",
        dark:    "#0A0A0A",
        surface: "#111111",
        card:    "#1A1A1A",
        border:  "#2A2A2A",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body:    ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}