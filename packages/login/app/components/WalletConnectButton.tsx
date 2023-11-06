import {
  ConnectWallet,
  ThirdwebProvider,
  coinbaseWallet,
  metamaskWallet,
  rainbowWallet,
  useAddress,
  walletConnect,
} from "@thirdweb-dev/react";
import { useEffect } from "react";
import { env } from "~/utils/env";

type Props = {
  onConnected: (address: string) => void;
};

const InnerWalletConnectButton = ({ onConnected }: Props) => {
  const address = useAddress();

  useEffect(() => {
    if (address) {
      onConnected(address);
    }
  }, [address, onConnected]);

  return (
    <ConnectWallet
      btnTitle={"Connect Web3 Wallet"}
      modalSize={"compact"}
      welcomeScreen={{ title: "" }}
      modalTitleIconUrl={""}
    />
  );
};

export const WalletConnectButton = (props: Props) => {
  return (
    <ThirdwebProvider
      clientId={env.VITE_THIRDWEB_CLIENT_ID}
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet(),
        walletConnect(),
        rainbowWallet(),
      ]}
    >
      <InnerWalletConnectButton {...props} />
    </ThirdwebProvider>
  );
};
