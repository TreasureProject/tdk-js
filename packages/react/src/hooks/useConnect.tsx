import {
  darkTheme,
  // useConnectModal,
  useWalletDetailsModal,
} from "thirdweb/react";

import {
  ConnectModal,
  type Options as ConnectModalOptions,
} from "../components/connect/ConnectModal";
import { useTreasure } from "../contexts/treasure";
import { getLocaleId } from "../i18n";

export type Options = ConnectModalOptions;

type Props = Options;

const theme = darkTheme({
  colors: {
    accentButtonBg: "#DC2626",
    accentButtonText: "#E7E8E9",
    accentText: "#DC2626",
    primaryButtonBg: "#DC2626",
    primaryButtonText: "#E7E8E9",
    modalBg: "#19253A",
    modalOverlayBg: "rgba(0, 0, 0, 0.3)",
    borderColor: "#70747D",
  },
});

export const useConnect = (props?: Props) => {
  const { chain, contractAddresses, client, logOut, setRootElement } =
    useTreasure();
  // const { connect } = useConnectModal();
  const { open: openWalletDetailsModal } = useWalletDetailsModal();

  const openConnectModal = () =>
    setRootElement(
      <ConnectModal
        open
        onOpenChange={() => setRootElement(null)}
        {...props}
      />,
    );

  const openAccountModal = () =>
    openWalletDetailsModal({
      client,
      theme,
      locale: getLocaleId(),
      supportedTokens: {
        [chain.id]: [
          ...(contractAddresses.MAGIC
            ? [
                {
                  address: contractAddresses.MAGIC,
                  name: "MAGIC",
                  symbol: "MAGIC",
                  icon: "https://images.treasure.lol/tdk/login/magic.png",
                },
              ]
            : []),
          ...(contractAddresses.VEE
            ? [
                {
                  address: contractAddresses.VEE,
                  name: "VEE",
                  symbol: "VEE",
                  icon: "https://images.treasure.lol/tdk/login/vee.png",
                },
              ]
            : []),
        ],
      },
      onDisconnect: () => {
        logOut();
      },
    });

  return { openConnectModal, openAccountModal };
};
