import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@treasure-project/tailwind-config/fonts.css";
import "@treasure/tdk-react/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

import { App } from "./App.tsx";
import "./index.css";

const config = getDefaultConfig({
  appName: "TDK Payments Example",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [arbitrumSepolia],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#DC2626",
          })}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
