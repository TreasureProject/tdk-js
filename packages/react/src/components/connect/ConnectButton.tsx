import { useTranslation } from "react-i18next";

import { useTreasure } from "../../contexts/treasure";
import {
  type Options as UseConnectOptions,
  useConnect,
} from "../../hooks/useConnect";
import { TreasureIcon } from "../../icons/TreasureIcon";
import { Button } from "../ui/Button";
import { ConnectButtonAuthenticatedView } from "./ConnectButtonAuthenticatedView";

type Props = UseConnectOptions;

export const ConnectButton = (props?: Props) => {
  const { t } = useTranslation();
  const { user, isConnecting } = useTreasure();
  const { openConnectModal, openAccountModal } = useConnect(props);
  return (
    <>
      {user ? (
        <ConnectButtonAuthenticatedView
          user={user}
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
          <span>{t("connect.action")}</span>
        </Button>
      )}
    </>
  );
};
