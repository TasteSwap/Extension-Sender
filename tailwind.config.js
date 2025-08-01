/** @type {import('tailwindcss').Config} */
export default {
  content: [
    ".src/popup/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    //"./popup.html" // include popup HTML if needed
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
