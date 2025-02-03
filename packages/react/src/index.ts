import "./globals.css";

export type * from "@treasure-dev/tdk-core";

export { ConnectButton } from "./ui/ConnectButton/ConnectButton";
export { ConnectModal } from "./ui/ConnectModal/ConnectModal";
export { Button } from "./ui/components/Button";
export { TreasureProvider, useTreasure } from "./providers/treasure";
export { useConnect } from "./ui/hooks/useConnect";
export {
  useContractAddress,
  useContractAddresses,
} from "./hooks/useContractAddress";
