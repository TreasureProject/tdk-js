import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-dev/tailwind-config/fonts.css";

import { treasureTopaz } from "@treasure-dev/tdk-core";
import { TreasureProvider } from "@treasure-dev/tdk-react";
import ReactDOM from "react-dom/client";
import { arbitrumSepolia } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

import { App } from "./App.tsx";
import { SESSION_OPTIONS_BY_CHAIN_ID } from "./constants";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  const params = new URLSearchParams(window.location.search);
  const defaultChainId =
    params.get("chain_id") === arbitrumSepolia.id.toString()
      ? arbitrumSepolia.id
      : treasureTopaz.id;
  ReactDOM.createRoot(root).render(
    <ThirdwebProvider>
      <TreasureProvider
        appName="Magicswap"
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={defaultChainId}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
        ecosystemId={import.meta.env.VITE_TDK_ECOSYSTEM_ID}
        ecosystemPartnerId={import.meta.env.VITE_TDK_ECOSYSTEM_PARTNER_ID}
        sessionOptions={SESSION_OPTIONS_BY_CHAIN_ID[defaultChainId]}
      >
        <App />
      </TreasureProvider>
    </ThirdwebProvider>,
  );
}
