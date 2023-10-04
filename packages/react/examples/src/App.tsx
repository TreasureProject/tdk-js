import { TreasureTag, useTreasureAccountDomains } from "@treasure/react";

import "./App.css";

function App() {
  const { data } = useTreasureAccountDomains({
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
  });

  if (!data?.treasuretag) {
    return null;
  }

  return (
    <>
      <h1>TreasureTag</h1>
      <TreasureTag tag={data.treasuretag.name} />
    </>
  );
}

export default App;
