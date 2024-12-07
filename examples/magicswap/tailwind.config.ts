import treasurePreset from "@treasure-dev/tailwind-config";
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [treasurePreset],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
