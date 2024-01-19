import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "@treasure-project/tailwind-config/fonts.css";
import { TreasureProvider } from "@treasure/tdk-react";
import "@treasure/tdk-react/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { App } from "./App.tsx";
import "./index.css";

const { chains, publicClient } = configureChains(
  [arbitrumSepolia],
  [publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: "TDK Harvester Example",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <TreasureProvider
          project="platform"
          chainId={import.meta.env.VITE_TDK_CHAIN_ID}
          apiUri={import.meta.env.VITE_TDK_API_URL}
          authConfig={{
            loginDomain: import.meta.env.VITE_TDK_LOGIN_DOMAIN,
            redirectUri: import.meta.env.VITE_TDK_LOGIN_REDIRECT_URI,
          }}
        >
          <App />
        </TreasureProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
);
