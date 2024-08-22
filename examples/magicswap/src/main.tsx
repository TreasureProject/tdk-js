import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-dev/tailwind-config/fonts.css";

import { TreasureProvider } from "@treasure-dev/tdk-react";
import ReactDOM from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";

import { App } from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <TreasureProvider
      appName="Magicswap"
      apiUri={import.meta.env.VITE_TDK_API_URL}
      defaultChainId={421614}
      clientId={import.meta.env.VITE_TDK_CLIENT_ID}
      sessionOptions={{
        backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
        approvedTargets: [
          "0x55d0cf68a1afe0932aff6f36c87efa703508191c", // MAGIC
          "0xfe592736200d7545981397ca7a8e896ac0c166d4", // Treasures
          "0xd0a4fbcc5cde863a2be50c75b564efd942b03154", // Router
          "0x0626699bc82858c16ae557b2eaad03a58cfcc8bd", // LP Token
        ],
      }}
    >
      <App />
    </TreasureProvider>
  </ThirdwebProvider>,
);
