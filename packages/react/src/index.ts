import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import "./globals.css";
import { en } from "./locales/en";

export * from "@treasure/tdk-core";
export { PaymentsCartModal } from "./components/PaymentsCartModal";
export { TreasureLoginButton } from "./components/login/TreasureLoginButton";
export { Button } from "./components/ui/Button";
export { TreasureProvider, useTreasure } from "./context";
export { useCalculatePaymentAmount } from "./hooks/payments/useCalculatePaymentAmount";
export { useMakePayment } from "./hooks/payments/useMakePayment";

i18n.use(initReactI18next).init({
  resources: { en },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
