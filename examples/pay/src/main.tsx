import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-dev/tailwind-config/fonts.css";

import { TreasureProvider } from "@treasure-dev/tdk-react";
import ReactDOM from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";

import "./index.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <TreasureProvider
      appName="Treasure Pay"
      apiUri={import.meta.env.VITE_TDK_API_URL}
      defaultChainId={421614}
      clientId={import.meta.env.VITE_TDK_CLIENT_ID}
    >
      <App />
    </TreasureProvider>
  </ThirdwebProvider>,
);
