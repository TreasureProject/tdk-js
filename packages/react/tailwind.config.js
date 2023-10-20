/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tdk-",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("@treasure-project/tailwind-config")],
  theme: {
    extend: {},
  },
  plugins: [],
};
