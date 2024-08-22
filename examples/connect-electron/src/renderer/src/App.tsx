import { ConnectButton } from "@treasure-dev/tdk-react";
import Versions from "./components/Versions";

function App(): JSX.Element {
  return (
    <>
      <p>
        <ConnectButton authMode="redirect" redirectUrl="http://google.com/" />
      </p>
      <Versions />
    </>
  );
}

export default App;
