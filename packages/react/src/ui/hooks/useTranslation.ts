import { useEffect, useMemo, useState } from "react";
import type { LocaleId } from "thirdweb/react";

import { useTreasure } from "../../providers/treasure";
import type { Translation } from "../../translations/en";
import en from "../../translations/en";

const SUPPORTED_LANGUAGES = ["en", "es", "ja", "ru"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (language: string): language is Language =>
  SUPPORTED_LANGUAGES.includes(language as Language);

const getTranslation = async (language: Language): Promise<Translation> => {
  switch (language) {
    case "es": {
      return (await import("../../translations/es")).default;
    }
    case "ja": {
      return (await import("../../translations/ja")).default;
    }
    case "ru": {
      return (await import("../../translations/ru")).default;
    }
    default:
      return en;
  }
};

type Options = {
  language?: Language;
};

export const useTranslation = (options?: Options) => {
  const treasure = useTreasure();
  const [translation, setTranslation] = useState(en);

  const browserLanguage = navigator?.language.slice(0, 2).toLowerCase();
  const language =
    options?.language ??
    treasure.language ??
    (browserLanguage && isSupportedLanguage(browserLanguage)
      ? browserLanguage
      : undefined) ??
    "en";

  useEffect(() => {
    (async () => {
      setTranslation(await getTranslation(language));
    })();
  }, [language]);

  const thirdwebLocale: LocaleId | undefined = useMemo(() => {
    switch (language) {
      case "en":
        return "en_US";
      case "es":
        return "es_ES";
      case "ja":
        return "ja_JP";
      default:
        return undefined;
    }
  }, [language]);

  return { language, thirdwebLocale, t: translation };
};
