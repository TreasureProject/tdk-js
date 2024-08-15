import {
  type ConnectMethod,
  DEFAULT_TDK_APP_ICON_URI,
  DEFAULT_TDK_APP_NAME,
} from "@treasure-dev/tdk-core";
import { type ButtonHTMLAttributes, useRef, useState } from "react";

import { Trans, useTranslation } from "react-i18next";
import { AppleIcon } from "../../icons/AppleIcon";
import { DiscordIcon } from "../../icons/DiscordIcon";
import { GoogleIcon } from "../../icons/GoogleIcon";
import { PasskeyIcon } from "../../icons/PasskeyIcon";
import { TelegramIcon } from "../../icons/TelegramIcon";
import { WalletIcon } from "../../icons/WalletIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { ConnectFooter } from "./ConnectFooter";

export type Options = {
  disablePasskey?: boolean;
  disableWallet?: boolean;
};

type Props = Options & {
  appName: string;
  appIconUri?: string;
  isLoading?: boolean;
  error?: string;
  onConnect: (method: ConnectMethod, email?: string) => void;
};

export const ConnectMethodSelectionView = ({
  appName,
  appIconUri = DEFAULT_TDK_APP_ICON_URI,
  isLoading = false,
  error,
  disablePasskey = false,
  disableWallet = false,
  onConnect,
}: Props) => {
  const { t } = useTranslation();
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  return (
    <div className="tdk-bg-night tdk-p-8 tdk-text-silver-100 tdk-font-sans tdk-space-y-6">
      <div className="tdk-flex tdk-items-center tdk-gap-3">
        <div className="tdk-w-12 tdk-h-12 tdk-bg-night-500 tdk-rounded-lg tdk-overflow-hidden">
          <img src={appIconUri} alt="" className="tdk-w-full tdk-h-full" />
        </div>
        <div>
          <Trans
            i18nKey="connect.header"
            values={{ appName: appName || DEFAULT_TDK_APP_NAME }}
          >
            <span className="tdk-text-sm tdk-text-silver tdk-block">
              Connect to
            </span>
            <span className="tdk-text-base tdk-block tdk-font-semibold">
              {appName}
            </span>
          </Trans>
        </div>
      </div>
      {error ? (
        <p className="tdk-bg-ruby-200 tdk-border tdk-border-ruby-800 tdk-text-ruby-800 tdk-px-3 tdk-py-2 tdk-rounded-md">
          {error}
        </p>
      ) : null}
      <form
        className="tdk-space-y-6"
        onSubmit={(e) => {
          e.preventDefault();

          if (email) {
            onConnect("email", email);
          } else {
            emailInputRef.current?.focus();
          }
        }}
      >
        <div className="tdk-space-y-1.5">
          <label
            className="tdk-block tdk-text-sm tdk-font-medium"
            htmlFor="email"
          >
            {t("common.emailLabel")}
          </label>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            className="tdk-w-full tdk-rounded-lg tdk-border tdk-border-solid tdk-border-night-500 tdk-bg-night tdk-px-3 tdk-py-2.5 tdk-text-white tdk-box-border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="tdk-w-full tdk-font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner className="tdk-w-3.5 tdk-h-3.5 tdk-mx-auto" />
          ) : (
            t("connect.action")
          )}
        </Button>
      </form>
      <div className="tdk-relative tdk-flex tdk-items-center tdk-justify-center">
        <div className="tdk-h-[1px] tdk-bg-night-500 tdk-absolute tdk-left-0 tdk-right-0 tdk-z-0" />
        <span className="tdk-text-sm tdk-text-silver-600 tdk-px-4 tdk-uppercase tdk-bg-night tdk-z-10">
          {t("common.or")}
        </span>
      </div>
      <div
        className={cn(
          "tdk-grid tdk-gap-2 tdk-grid-cols-2",
          disablePasskey ? "md:tdk-grid-cols-4" : "md:tdk-grid-cols-5",
        )}
      >
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("google")}
        >
          <GoogleIcon className="tdk-w-6 tdk-h-6 tdk-mx-auto tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors" />
          <span className="tdk-block">{t("connect.option.google")}</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("telegram")}
        >
          <TelegramIcon className="tdk-w-6 tdk-h-6 tdk-mx-auto tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors" />
          <span className="tdk-block">{t("connect.option.telegram")}</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("discord")}
        >
          <DiscordIcon className="tdk-w-6 tdk-h-6 tdk-mx-auto tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors" />
          <span className="tdk-block">{t("connect.option.discord")}</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group tdk-space-y-0.5"
          onClick={() => onConnect("apple")}
        >
          <AppleIcon className="tdk-w-5 tdk-h-5 tdk-mx-auto tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors" />
          <span className="tdk-block">{t("connect.option.apple")}</span>
        </ConnectMethodButton>
        {!disablePasskey ? (
          <ConnectMethodButton
            className="tdk-group tdk-col-span-2 md:tdk-col-span-1 tdk-flex tdk-items-center tdk-justify-center tdk-gap-1 tdk-py-2 md:tdk-block"
            onClick={() => onConnect("passkey")}
          >
            <PasskeyIcon className="tdk-w-6 tdk-h-6 md:tdk-mx-auto tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors" />
            <span className="tdk-block">{t("connect.option.passkey")}</span>
          </ConnectMethodButton>
        ) : null}
        {!disableWallet ? (
          <ConnectMethodButton
            className={cn(
              "tdk-group tdk-flex tdk-items-center tdk-gap-1 tdk-justify-center tdk-py-2 tdk-col-span-2",
              disablePasskey ? "md:tdk-col-span-4" : "md:tdk-col-span-5",
            )}
            onClick={() => onConnect("wallet")}
          >
            <WalletIcon className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors" />
            {t("connect.option.wallet")}
          </ConnectMethodButton>
        ) : null}
      </div>
      <ConnectFooter />
    </div>
  );
};

const ConnectMethodButton = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type="button"
      className={cn(
        "tdk-bg-night-500 tdk-border tdk-border-solid tdk-border-night-400 tdk-p-3 tdk-text-xs tdk-text-silver-100 tdk-font-medium tdk-cursor-pointer hover:tdk-bg-cream hover:tdk-border-cream tdk-transition-colors hover:tdk-text-night-800 tdk-rounded-lg",
        className,
      )}
      {...props}
    />
  );
};
