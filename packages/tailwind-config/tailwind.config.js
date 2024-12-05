/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    fontWeight: {
      regular: "400",
      medium: "500",
      bold: "600",
      heavy: "700",
      black: "800",
    },
    extend: {
      fontFamily: {
        sans: ["Whyte", ...defaultTheme.fontFamily.sans],
        mono: ["GroteskSemi", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        ruby: {
          100: "#FFD6D6",
          200: "#FF8686",
          300: "#FF6F6F",
          400: "#FF4A4A",
          500: "#F42F2F",
          600: "#DC2626",
          700: "#C62222",
          800: "#9C1919",
          900: "#701313",
          1000: "#4D1212",
          DEFAULT: "#DC2626", // ruby-600
        },
        "ruby-marketing": "#FF3737",
        honey: {
          100: "#FFFAEF",
          200: "#FDEBC0",
          300: "#FCE2A0",
          400: "#FCD980",
          500: "#FACE61",
          600: "#F4C142",
          700: "#E7AF24",
          800: "#C9981F",
          900: "#8D6B16",
          1000: "#463711",
          DEFAULT: "#FACE61", // honey-500
        },
        silver: {
          100: "#E7E8E9",
          200: "#CFD1D4",
          300: "#B7BABE",
          400: "#9FA3A9",
          500: "#888C93",
          600: "#70747D",
          700: "#575A61",
          800: "#474A50",
          900: "#353940",
          1000: "#25272C",
          DEFAULT: "#9FA3A9", // silver-400
        },
        night: {
          100: "#586C8D",
          200: "#364663",
          300: "#283852",
          400: "#1F2D45",
          500: "#19253A",
          600: "#172135",
          700: "#131D2E",
          800: "#0E1725",
          900: "#0C1421",
          1000: "#0A111C",
          DEFAULT: "#131D2E", // night-700
        },
        sapphire: {
          100: "#E0F3FE",
          200: "#CAECFF",
          300: "#90D7FF",
          400: "#61C2FA",
          500: "#49AEE8",
          600: "#3391C7",
          700: "#165F89",
          800: "#0E4665",
          900: "#0C2537",
          DEFAULT: "#49AEE8", // sapphire-500
        },
        nebula: {
          100: "#E6DBFF",
          200: "#BEA0FF",
          300: "#A074FF",
          400: "#7C41FF",
          500: "#662FDD",
          600: "#511EBF",
          700: "#42189D",
          800: "#330C86",
          900: "#260768",
          DEFAULT: "#662FDD", // nebula-500
        },
        emerald: {
          100: "#EEFFF5",
          200: "#D4FDE5",
          300: "#B6FCD2",
          400: "#83F8B1",
          500: "#4AE387",
          600: "#33C76E",
          700: "#168944",
          800: "#127239",
          900: "#0C4B25",
          1000: "#0C3720",
          DEFAULT: "#4AE387", // emerald-500
        },
        cream: "#FFFCF5",
        success: "#4AE387", // emerald-500
      },
    },
  },
};
