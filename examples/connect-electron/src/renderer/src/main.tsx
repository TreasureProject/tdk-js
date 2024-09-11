import "@treasure-dev/tdk-react/dist/index.css";
import "./assets/main.css";

import { TreasureProvider } from "@treasure-dev/tdk-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <TreasureProvider
        appName="Electron App"
        apiUri={import.meta.env.VITE_TDK_API_URL}
        defaultChainId={421614}
        clientId={import.meta.env.VITE_TDK_CLIENT_ID}
        ecosystemId={import.meta.env.VITE_TDK_ECOSYSTEM_ID}
        ecosystemPartnerId={import.meta.env.VITE_TDK_ECOSYSTEM_PARTNER_ID}
        language="en"
        autoConnectTimeout={30000}
      >
        <App />
      </TreasureProvider>
    </ThirdwebProvider>
  </React.StrictMode>,
);
