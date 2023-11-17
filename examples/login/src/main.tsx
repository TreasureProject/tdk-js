import "@treasure-project/tailwind-config/fonts.css";
import { TreasureProvider } from "@treasure/tdk-react";
import "@treasure/tdk-react/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TreasureProvider
      project="platform"
      chainId={import.meta.env.VITE_TDK_CHAIN_ID}
      authConfig={{
        loginDomain: import.meta.env.VITE_TDK_LOGIN_DOMAIN,
        redirectUri: import.meta.env.VITE_TDK_LOGIN_REDIRECT_URI,
      }}
    >
      <App />
    </TreasureProvider>
  </React.StrictMode>,
);
