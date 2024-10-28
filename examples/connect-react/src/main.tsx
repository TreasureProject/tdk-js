import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-dev/tailwind-config/fonts.css";

import { treasureTopaz } from "@treasure-dev/tdk-core";
import { TreasureProvider } from "@treasure-dev/tdk-react";
import ReactDOM from "react-dom/client";
import { toWei } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";

import { App } from "./App.tsx";
import "./index.css";
import { TOPAZ_NFT_ADDRESS, TREASURY_ADDRESS } from "./constants";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <ThirdwebProvider>
      <TreasureProvider
        appName="Treasure"
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={treasureTopaz.id}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
        ecosystemId={import.meta.env.VITE_TDK_ECOSYSTEM_ID}
        ecosystemPartnerId={import.meta.env.VITE_TDK_ECOSYSTEM_PARTNER_ID}
        sessionOptions={{
          backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
          approvedTargets: [TOPAZ_NFT_ADDRESS, TREASURY_ADDRESS],
          nativeTokenLimitPerTransaction: toWei("1"),
        }}
        analyticsOptions={{
          apiKey: import.meta.env.VITE_TDK_ANALYTICS_API_KEY,
          appInfo: {
            app_identifier: "lol.treasure.examples-react",
            app_version: "1.0.0",
            app_environment: 0,
          },
          cartridgeTag: "tdk-examples-connect-react",
        }}
      >
        <App />
      </TreasureProvider>
    </ThirdwebProvider>,
  );
}
