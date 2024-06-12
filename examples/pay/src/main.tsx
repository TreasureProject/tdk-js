import { getDefaultConfig } from "@rainbow-me/rainbowkit";
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
  appName: "Treasure Pay Example",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [arbitrumSepolia],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TreasureProvider
          project="pay"
          chainId={import.meta.env.VITE_TDK_CHAIN_ID}
          apiUri={import.meta.env.VITE_TDK_API_URL}
          authConfig={{
            loginDomain: import.meta.env.VITE_TDK_LOGIN_DOMAIN,
            redirectUri: import.meta.env.VITE_TDK_LOGIN_REDIRECT_URI,
          }}
        >
          <App />
        </TreasureProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
