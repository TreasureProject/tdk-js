import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TreasureProvider } from "@treasure-dev/tdk-react";
import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-project/tailwind-config/fonts.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

import { App } from "./App.tsx";
import "./index.css";

const config = getDefaultConfig({
  appName: "TDK Harvester Example",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [arbitrumSepolia],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TreasureProvider
            apiUri={import.meta.env.VITE_TDK_API_URL}
            chainId={arbitrumSepolia.id}
            clientId={import.meta.env.VITE_TDK_CLIENT_ID}
            sessionOptions={{
              backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
              approvedTargets: [
                "0x55d0cf68a1afe0932aff6f36c87efa703508191c", // MAGIC
                "0x9d012712d24c90dded4574430b9e6065183896be", // Consumables
                "0x816c0717cf263e7da4cd33d4979ad15dbb70f122", // Emberwing Harvester
                "0x94c64b689336b3f0388503cc1cb4a193520dff73", // Emberwing NftHandler
              ],
            }}
          >
            <App />
          </TreasureProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
