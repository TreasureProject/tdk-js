import { ConnectButton } from "@treasure-dev/tdk-react";
import { useEffect } from "react";
import { initIpcListeners } from "./IpcListeners";
import Versions from "./components/Versions";

let started = false;

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
        <ConnectButton redirectUrl={`${window.location.origin}/auth/`} />
      </p>
      <Versions />
    </>
  );
}

export default App;
