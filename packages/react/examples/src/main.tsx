import React from "react";
import ReactDOM from "react-dom/client";

import { TreasureProvider } from "../../src/context.tsx";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TreasureProvider projectId={import.meta.env.VITE_TREASURE_PROJECT_ID}>
      <App />
    </TreasureProvider>
  </React.StrictMode>,
);
