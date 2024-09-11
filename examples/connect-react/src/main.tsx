import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-dev/tailwind-config/fonts.css";

import { TreasureProvider } from "@treasure-dev/tdk-react";
import ReactDOM from "react-dom/client";
import { toWei } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";

import { App } from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <ThirdwebProvider>
      <TreasureProvider
        appName="Treasure"
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={421614}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
        ecosystemId={import.meta.env.VITE_TDK_ECOSYSTEM_ID}
        ecosystemPartnerId={import.meta.env.VITE_TDK_ECOSYSTEM_PARTNER_ID}
        sessionOptions={{
          backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
          approvedTargets: [
            "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
            "0xE647b2c46365741e85268ceD243113d08F7E00B8",
          ],
          nativeTokenLimitPerTransaction: toWei("1"),
        }}
      >
        <App />
      </TreasureProvider>
    </ThirdwebProvider>,
  );
}
