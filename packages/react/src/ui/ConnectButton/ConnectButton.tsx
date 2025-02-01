import { useTreasure } from "../../providers/treasure";
import { Button } from "../components/Button";
import {
  type Options as UseConnectOptions,
  useConnect,
} from "../hooks/useConnect";
import { useTranslation } from "../hooks/useTranslation";
import { TreasureIcon } from "../icons/TreasureIcon";
import { ConnectButtonAuthenticatedView } from "./ConnectButtonAuthenticatedView";

type Props = UseConnectOptions;

export const ConnectButton = (props?: Props) => {
  const { t } = useTranslation();
  const { userAddress, user, isConnecting, isConnected } = useTreasure();
  const { openConnectModal, openAccountModal } = useConnect(props);
  return (
    <>
      {isConnected ? (
        <ConnectButtonAuthenticatedView
          address={userAddress}
          pfp={user.pfp}
          tag={user.tag}
          onClick={openAccountModal}
        />
      ) : (
        <Button
          className="tdk-flex tdk-items-center tdk-justify-center tdk-gap-1 tdk-min-w-[115px]"
          isLoading={isConnecting}
          onClick={openConnectModal}
        >
          <TreasureIcon
            className="tdk-w-5 tdk-h-5 tdk-text-cream"
            starsFill="#C62222"
          />
          <span>{t.connect.action}</span>
        </Button>
      )}
    </>
  );
};
