import treasurePreset from "@treasure-dev/tailwind-config";
import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  prefix: "tdk-",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [treasurePreset],
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
  plugins: [animatePlugin],
  corePlugins: {
    preflight: false,
  },
} satisfies Config;
