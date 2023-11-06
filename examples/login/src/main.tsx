import "@treasure-project/tailwind-config/fonts.css";
import { TreasureProvider } from "@treasure/tdk-react";
import "@treasure/tdk-react/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TreasureProvider project="platform">
      <App />
    </TreasureProvider>
  </React.StrictMode>,
);
