import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import "./globals.css";
import { en } from "./locales/en";

export * from "@treasure-dev/tdk-core";
export { PaymentsCartModal } from "./components/PaymentsCartModal";
export { ConnectButton } from "./components/connect/ConnectButton";
export { Button } from "./components/ui/Button";
export { TreasureProvider, useTreasure } from "./contexts/treasure";
export { useApproval } from "./hooks/approvals/useApproval";
export { useHarvester } from "./hooks/harvesters/useHarvester";
export {
  useContractAddress,
  useContractAddresses,
} from "./hooks/useContractAddress";
export { useTokenBalances } from "./hooks/useTokenBalances";
export { useCalculatePaymentAmount } from "./hooks/payments/useCalculatePaymentAmount";
export { useMakePayment } from "./hooks/payments/useMakePayment";
export { AppleLogoIcon } from "./icons/AppleLogoIcon";
export { GoogleLogoIcon } from "./icons/GoogleLogoIcon";
export { XLogoIcon } from "./icons/XLogoIcon";

i18n.use(initReactI18next).init({
  resources: { en },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
