import { truncateEthAddress } from "@treasure-dev/tdk-core";
import { useTranslation } from "react-i18next";
import { useTreasure } from "../../contexts/treasure";
import { useConnect } from "../../hooks/useConnect";
import { TreasureIcon } from "../../icons/TreasureIcon";
import { Button } from "../ui/Button";

import type { InAppWalletAuth } from "thirdweb/wallets";
import { Dialog, DialogContent } from "../ui/Dialog";
import { Spinner } from "../ui/Spinner";

type Props = {
  appName: string;
  appIconUri?: string;
  theme?: "light" | "dark";
  supportedAuthOptions?: InAppWalletAuth[];
};

export const ConnectButton = ({
  appName,
  appIconUri,
  theme = "light",
  supportedAuthOptions,
}: Props) => {
  const { t } = useTranslation();
  const { user, isConnecting } = useTreasure();
  const { status, description, openConnectModal, openAccountModal } =
    useConnect({
      appName,
      appIconUri,
      theme,
      supportedAuthOptions,
    });
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
      <Dialog
        open={
          !user && (status === "loading" || status === "error") && !!description
        }
      >
        <DialogContent>
          <div className="tdk-max-w-[360px] tdk-bg-honey-25 tdk-shadow-lg tdk-rounded-[20px] tdk-p-6 tdk-mx-auto tdk-flex tdk-items-center tdk-justify-center tdk-flex-col tdk-text-lg">
            {status === "error" ? (
              <h1 className="tdk-text-xl tdk-font-medium">Error occurred:</h1>
            ) : null}
            <p className="tdk-space-y-4 tdk-text-center">
              <span className="tdk-block">{description}</span>
              {status === "loading" ? (
                <Spinner className="tdk-text-ruby-900 tdk-w-6 tdk-h-6 tdk-mx-auto" />
              ) : status === "error" ? (
                <Button>{t("common.close")}</Button>
              ) : null}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
