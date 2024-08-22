import { useEffect } from 'react';
import { ConnectButton } from "@treasure-dev/tdk-react";
import Versions from "./components/Versions";
import { initIpcListeners } from './IpcListeners';

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
        <ConnectButton authMode="redirect" redirectUrl={`${window.location.origin}/auth/`} />
      </p>
      <Versions />
    </>
  );
}

export default App;
