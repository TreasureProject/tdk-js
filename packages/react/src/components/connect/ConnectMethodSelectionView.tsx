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
import { WalletIcon } from "../../icons/WalletIcon";
import { XIcon } from "../../icons/XIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";
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
  disablePasskey = true,
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
        {/* Screen reader title is in ConnectModal */}
        <div aria-hidden="true" className="tdk-text-silver-400 tdk-text-sm">
          <Trans
            i18nKey="connect.header"
            values={{ appName: appName || DEFAULT_TDK_APP_NAME }}
          >
            Connect to
            <span className="tdk-text-lg tdk-block tdk-font-semibold tdk-text-silver-100">
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
          <label className="tdk-block tdk-text-sm" htmlFor="email">
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
        <Button type="submit" className="tdk-w-full" isLoading={isLoading}>
          {t("connect.action")}
        </Button>
      </form>
      <div className="tdk-relative tdk-flex tdk-items-center tdk-justify-center">
        <div className="tdk-h-[1px] tdk-bg-night-500 tdk-absolute tdk-left-0 tdk-right-0 tdk-z-0" />
        <span className="tdk-text-sm tdk-text-silver-600 tdk-px-4 tdk-uppercase tdk-bg-night tdk-z-10">
          {t("common.or")}
        </span>
      </div>
      <div className="tdk-grid tdk-gap-2 tdk-grid-cols-2 md:tdk-grid-cols-4">
        <ConnectMethodButton
          title={t("connect.option.google")}
          onClick={() => onConnect("google")}
          disabled={isLoading}
        >
          <GoogleIcon className="tdk-w-7 tdk-h-7" />
        </ConnectMethodButton>
        <ConnectMethodButton
          title={t("connect.option.x")}
          onClick={() => onConnect("x")}
          disabled={isLoading}
        >
          <XIcon className="tdk-w-5 tdk-h-5" />
        </ConnectMethodButton>
        <ConnectMethodButton
          title={t("connect.option.discord")}
          onClick={() => onConnect("discord")}
          disabled={isLoading}
        >
          <DiscordIcon className="tdk-w-6 tdk-h-6" />
        </ConnectMethodButton>
        <ConnectMethodButton
          title={t("connect.option.apple")}
          onClick={() => onConnect("apple")}
          disabled={isLoading}
        >
          <AppleIcon className="tdk-w-5 tdk-h-5" />
        </ConnectMethodButton>
        {!disablePasskey ? (
          <ConnectMethodButton
            className="tdk-flex tdk-items-center tdk-gap-1 tdk-justify-center tdk-py-2 tdk-col-span-full"
            onClick={() => onConnect("passkey")}
            disabled={isLoading}
          >
            <PasskeyIcon className="tdk-w-6 tdk-h-6" />
            <span className="tdk-block">{t("connect.option.passkey")}</span>
          </ConnectMethodButton>
        ) : null}
        {!disableWallet ? (
          <ConnectMethodButton
            className="tdk-flex tdk-items-center tdk-gap-1 tdk-justify-center tdk-py-2 tdk-col-span-full"
            onClick={() => onConnect("wallet")}
            disabled={isLoading}
          >
            <WalletIcon className="tdk-w-6 tdk-h-6" />
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
        "tdk-flex tdk-items-center tdk-justify-center tdk-bg-night-500 tdk-border tdk-border-solid tdk-border-night-400 tdk-p-3 tdk-text-xs tdk-text-silver-100 tdk-transition-colors tdk-rounded-lg",
        props.disabled
          ? "tdk-opacity-50 tdk-cursor-not-allowed"
          : "tdk-cursor-pointer hover:tdk-bg-cream hover:tdk-border-cream hover:tdk-text-night-800",
        className,
      )}
      {...props}
    />
  );
};
