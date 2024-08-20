/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tdk-",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("@treasure-dev/tailwind-config")],
  theme: {
    extend: {
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    preflight: false,
  },
};
