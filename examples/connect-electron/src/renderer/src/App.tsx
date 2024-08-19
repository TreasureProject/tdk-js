import { ConnectButton } from "@treasure-dev/tdk-react";
import Versions from "./components/Versions";

function App(): JSX.Element {
  return (
    <>
      <p>
        <ConnectButton />
      </p>
      <Versions />
    </>
  );
}

export default App;
