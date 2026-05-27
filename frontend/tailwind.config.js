/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A8C7A",
        secondary: "#1C2B3A",
        purple: {
          600: "#7C3AED",
          700: "#6D28D9",
        },
        brand: "#2d1b69",
      }
    },
  },
  plugins: [],
}