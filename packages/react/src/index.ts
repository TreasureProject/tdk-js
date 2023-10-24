import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import "./globals.css";

export * from "@treasure/core";
export * from "./context";
export * from "./components";
export * from "./hooks";
export * from "./icons";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        common: {
          loading: "Loading...",
          close: "Close",
          items_one: "1 item",
          items_other: "{{count}} items",
          removeItem: "Remove item",
          total: "Total",
          moreInfo: "More info",
          insufficientBalance: "Insufficient balance",
        },
        payments: {
          cart: {
            title: "Checkout Overview",
            title_success: "Transaction Completed",
            terms:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
            termsCopy: "© 2021-2023 Treasure. All Rights Reserved.",
            optionsTitle: "Select payment token:",
            submit: "Check out",
            approveAndSubmit: "Approve & check out",
            successMessageTitle: "Thanks for your order!",
            successMessageDescription:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
          },
        },
      },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
