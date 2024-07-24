import { TreasureProvider } from "@treasure-dev/tdk-react";
import "@treasure-dev/tdk-react/dist/index.css";
import "@treasure-project/tailwind-config/fonts.css";
import ReactDOM from "react-dom/client";
import { parseEther } from "viem";

import { App } from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TreasureProvider
    apiUri={import.meta.env.VITE_TDK_API_URL}
    chainId={421614}
    clientId={import.meta.env.VITE_TDK_CLIENT_ID}
    sessionOptions={{
      backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
      approvedTargets: [
        "0x55d0cf68a1afe0932aff6f36c87efa703508191c", // MAGIC
        "0xE647b2c46365741e85268ceD243113d08F7E00B8",
        "0xfe592736200d7545981397ca7a8e896ac0c166d4", // Treasures
        "0xd0a4fbcc5cde863a2be50c75b564efd942b03154", // Router
      ],
      nativeTokenLimitPerTransaction: parseEther("1"),
    }}
  >
    <App />
  </TreasureProvider>,
);
