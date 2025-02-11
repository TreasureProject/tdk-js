import "@treasure-dev/tdk-react/dist/index.css";
import "./assets/main.css";

import { TreasureProvider } from "@treasure-dev/tdk-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";

import { toWei } from "thirdweb";
import App from "./App";
import icon from "./assets/electron.svg";

const getAuthToken = () =>
  window.electron?.ipcRenderer.sendSync("get-auth-token");
const getWalletComponents = () =>
  window.electron?.ipcRenderer.sendSync("get-wallet-components");
const getPort = () => window.electron?.ipcRenderer.sendSync("get-port");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <TreasureProvider
        appName="Electron App"
        appIconUri={icon}
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={978658}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
        ecosystemId={import.meta.env.VITE_TDK_ECOSYSTEM_ID}
        ecosystemPartnerId={import.meta.env.VITE_TDK_ECOSYSTEM_PARTNER_ID}
        language="en"
        autoConnectTimeout={30000}
        sessionOptions={{
          backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
          approvedTargets: [
            "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
            "0xE647b2c46365741e85268ceD243113d08F7E00B8",
          ],
          nativeTokenLimitPerTransaction: toWei("1"),
        }}
        launcherOptions={{
          getAuthTokenOverride: getAuthToken,
          getWalletComponentsOverride: getWalletComponents,
          getPortOverride: getPort,
        }}
      >
        <App />
      </TreasureProvider>
    </ThirdwebProvider>
  </React.StrictMode>,
);
