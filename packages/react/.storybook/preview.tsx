/// <reference types="vite/client" />
import type { Preview } from "@storybook/react";
import React from "react";

import { TreasureProvider } from "../src/contexts/treasure";

import "../src/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <TreasureProvider
        appName="Storybook"
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={421614}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
      >
        <Story />
      </TreasureProvider>
    ),
  ],
};

export default preview;
