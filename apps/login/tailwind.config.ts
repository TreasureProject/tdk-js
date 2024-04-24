import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("@treasure-project/tailwind-config")],
  plugins: [],
  corePlugins: {
    preflight: false,
  },
} satisfies Config;
