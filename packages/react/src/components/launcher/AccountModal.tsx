import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { DEFAULT_TDK_APP_ICON_URI } from "@treasure-dev/tdk-core";
import clsx from "clsx";
import { Trans } from "react-i18next";
import { MediaRenderer, useWalletImage } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";

import { useTreasure } from "../../contexts/treasure";
import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";

type Props = {
  open: boolean;
  size?: "lg" | "xl" | "2xl" | "3xl";
  onOpenChange: (open: boolean) => void;
};

export const AccountModal = ({ open, size = "lg", onOpenChange }: Props) => {
  const {
    client,
    user,
    userAddress,
    appName,
    appIconUri = DEFAULT_TDK_APP_ICON_URI,
    ecosystemId,
  } = useTreasure();

  const { data: walletImage } = useWalletImage(ecosystemId);

  if (!user) {
    return null;
  }

  const userWalletImage = user.pfp ?? walletImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={clsx(
          size === "lg" && "tdk-max-w-lg",
          size === "xl" && "tdk-max-w-xl",
          size === "2xl" && "tdk-max-w-2xl",
          size === "3xl" && "tdk-max-w-3xl",
        )}
        aria-describedby={undefined}
      >
        <VisuallyHidden.Root>
          <DialogTitle>
            <Trans i18nKey="connect.header" values={{ appName }}>
              <span>Connect to</span>
              <span>{appName}</span>
            </Trans>
          </DialogTitle>
        </VisuallyHidden.Root>
        <div className="tdk-rounded-lg tdk-overflow-hidden tdk-bg-night tdk-border tdk-border-night-600">
          <div className="tdk-p-6 tdk-flex tdk-flex-col tdk-items-center">
            {appIconUri && (
              <img
                src={appIconUri}
                alt={appName}
                className="tdk-w-16 tdk-h-16"
              />
            )}
            <h1 className="tdk-mt-4 tdk-text-2xl tdk-font-semibold">
              {appName}
            </h1>
            <div className="tdk-mt-6 tdk-flex tdk-items-center tdk-space-x-4">
              {userWalletImage ? (
                <MediaRenderer
                  client={client}
                  src={userWalletImage}
                  className="tdk-w-12 tdk-h-12 tdk-rounded-full"
                />
              ) : (
                <div className="tdk-w-12 tdk-h-12 tdk-rounded-full tdk-bg-gray-500" />
              )}
              <div>
                <h2 className="tdk-text-lg tdk-font-semibold">
                  {user.tag || shortenAddress(userAddress)}
                </h2>
                {user.email && (
                  <p className="tdk-text-sm tdk-text-gray-400">{user.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
