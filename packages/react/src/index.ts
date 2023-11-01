import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import "./globals.css";
import { en } from "./locales";

export * from "@treasure/tdk-core";
export * from "./context";
export * from "./components";
export * from "./hooks";
export * from "./icons";

i18n.use(initReactI18next).init({
  resources: { en },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
