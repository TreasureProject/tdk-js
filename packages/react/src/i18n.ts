import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import type { LocaleId } from "thirdweb/react";
import { en } from "./translations/en";
import { es } from "./translations/es";
import { ru } from "./translations/ru";
import { ja } from "./translations/ja";

export type SupportedLanguage = "en" | "es" | "ru" | "ja";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, es, ru, ja },
    fallbackLng: "en",
    cleanCode: true,
    interpolation: {
      escapeValue: false,
    },
  });

export const getLocaleId = (): LocaleId | undefined => {
  switch (i18n.language) {
    case "en":
      return "en_US";
    case "es":
      return "es_ES";
    default:
      return undefined;
  }
};

export { i18n };
