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
      <TreasureProvider appName="Storybook" clientId="unknown">
        <Story />
      </TreasureProvider>
    ),
  ],
};

export default preview;
