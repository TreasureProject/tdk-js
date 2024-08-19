/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tdk-",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("@treasure-dev/tailwind-config")],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    preflight: false,
  },
};
