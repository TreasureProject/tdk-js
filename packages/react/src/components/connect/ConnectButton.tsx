import { truncateEthAddress } from "@treasure-dev/tdk-core";
import { useTranslation } from "react-i18next";
import { useTreasure } from "../../contexts/treasure";
import { useConnect } from "../../hooks/useConnect";
import { TreasureIcon } from "../../icons/TreasureIcon";
import { Button } from "../ui/Button";

import { Spinner } from "../ui/Spinner";

export const ConnectButton = () => {
  const { t } = useTranslation();
  const { user, isConnecting } = useTreasure();
  const { openConnectModal, openAccountModal } = useConnect();
  return (
    <>
      {user ? (
        <button
          type="button"
          className="tdk-p-3 tdk-bg-cream tdk-flex tdk-items-center tdk-justify-between tdk-gap-5 hover:tdk-bg-honey-400 tdk-transition-colors tdk-rounded-xl tdk-text-left focus:tdk-outline-none"
          onClick={openAccountModal}
        >
          <div>
            {user.email ? (
              <span className="tdk-text-sm tdk-text-night-1000 tdk-font-medium tdk-block">
                {user.email}
              </span>
            ) : null}
            <span className="tdk-text-xs tdk-text-silver-600 tdk-block">
              {truncateEthAddress(user.address)}
            </span>
          </div>
          <TreasureIcon className="tdk-w-8 tdk-h-8 tdk-text-ruby-900" />
        </button>
      ) : (
        <Button
          className="tdk-flex tdk-items-center tdk-justify-center tdk-gap-1 tdk-min-w-32"
          onClick={openConnectModal}
        >
          {isConnecting ? (
            <Spinner className="tdk-w-5 tdk-h-5" />
          ) : (
            <>
              <TreasureIcon
                className="tdk-w-5 tdk-h-5 tdk-text-white"
                starsFill="#C62222"
              />
              <span>{t("login.connect")}</span>
            </>
          )}
        </Button>
      )}
    </>
  );
};
