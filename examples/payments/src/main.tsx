import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import "@treasure-project/tailwind-config/fonts.css";
import "@treasure/tdk-react/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { App } from "./App.tsx";
import "./index.css";

const { chains, publicClient } = configureChains(
  [arbitrumGoerli],
  [publicProvider()],
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [injectedWallet({ chains })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#DC2626",
        })}
      >
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
);
