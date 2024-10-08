import "@treasure-dev/tdk-react/dist/index.css";
import "./assets/main.css";

import { TreasureProvider } from "@treasure-dev/tdk-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";

import App from "./App";

const getAuthToken = () =>
  window.electron.ipcRenderer.sendSync("get-auth-token");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <TreasureProvider
        appName="Electron App"
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={421614}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
        language="en"
        autoConnectTimeout={30000}
        getAuthTokenOverride={getAuthToken}
      >
        <App />
      </TreasureProvider>
    </ThirdwebProvider>
  </React.StrictMode>,
);
