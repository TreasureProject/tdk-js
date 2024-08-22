/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("@treasure-dev/tailwind-config")],
  theme: {
    extend: {},
  },
  plugins: [],
};
