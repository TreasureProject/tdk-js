import { ConnectButton } from "@treasure-dev/tdk-react";
import { useEffect } from "react";
import { initIpcListeners } from "./IpcListeners";
import Versions from "./components/Versions";

let started = false;

const isPackaged = import.meta.env.MODE !== "development";

function App(): JSX.Element {
  useEffect(() => {
    if (!started) {
      started = true;
      initIpcListeners();
    }
  }, []);

  return (
    <>
      <p>
        <ConnectButton
          redirectUrl={`${!isPackaged && typeof window !== "undefined" ? window.location.origin : "http://localhost:5180"}/auth/`}
        />
      </p>
      <Versions />
    </>
  );
}

export default App;
