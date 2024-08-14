import type { ConnectMethod } from "@treasure-dev/tdk-core";
import { type ButtonHTMLAttributes, useState } from "react";

import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ConnectFooter } from "./ConnectFooter";

export type Options = {
  disablePasskey?: boolean;
  disableWallet?: boolean;
};

type Props = Options & {
  appName: string;
  appIconUri?: string;
  onConnect: (method: ConnectMethod, email?: string) => void;
};

export const ConnectMethodSelectionView = ({
  appName,
  appIconUri = "https://images.treasure.lol/tdk/login/treasure_icon.png",
  disablePasskey = false,
  disableWallet = false,
  onConnect,
}: Props) => {
  const [email, setEmail] = useState("");
  return (
    <div className="tdk-bg-night tdk-p-8 tdk-text-silver-100 tdk-font-sans tdk-space-y-6">
      <div className="tdk-flex tdk-items-center tdk-gap-3">
        <div className="tdk-w-12 tdk-h-12 tdk-bg-night-500 tdk-rounded-lg tdk-overflow-hidden">
          <img src={appIconUri} alt="" className="tdk-w-full tdk-h-full" />
        </div>
        <div>
          <span className="tdk-text-sm tdk-text-silver tdk-block">
            Connect to
          </span>
          <span className="tdk-text-base tdk-block tdk-font-semibold">
            {appName ?? "App"}
          </span>
        </div>
      </div>
      <form
        className="tdk-space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onConnect("email", email);
        }}
      >
        <div className="tdk-space-y-1.5">
          <label
            className="tdk-block tdk-text-sm tdk-font-medium"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="tdk-w-full tdk-rounded-lg tdk-border tdk-border-solid tdk-border-night-500 tdk-bg-night tdk-px-3 tdk-py-2.5 tdk-text-white tdk-box-border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="tdk-w-full tdk-font-medium">
          Connect
        </Button>
      </form>
      <div className="tdk-relative tdk-flex tdk-items-center tdk-justify-center">
        <div className="tdk-h-[1px] tdk-bg-night-500 tdk-absolute tdk-left-0 tdk-right-0 tdk-z-0" />
        <span className="tdk-text-sm tdk-text-silver-600 tdk-px-4 tdk-uppercase tdk-bg-night tdk-z-10">
          or
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
          <Icon
            name="google"
            className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors"
          />
          <span className="tdk-block">Google</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("telegram")}
        >
          <Icon
            name="telegram"
            className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors"
          />
          <span className="tdk-block">Telegram</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("discord")}
        >
          <Icon
            name="discord"
            className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors"
          />
          <span className="tdk-block">Discord</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("apple")}
        >
          <Icon
            name="apple"
            className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors"
          />
          <span className="tdk-block">Apple</span>
        </ConnectMethodButton>
        {!disablePasskey ? (
          <ConnectMethodButton
            className="tdk-group tdk-col-span-2 md:tdk-col-span-1 tdk-flex tdk-items-center tdk-justify-center tdk-gap-1 tdk-py-2 md:tdk-block"
            onClick={() => onConnect("passkey")}
          >
            <Icon
              name="passkey"
              className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors"
            />
            <span className="tdk-block">Passkey</span>
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
            <Icon
              name="wallet"
              className="tdk-w-6 tdk-h-6 tdk-text-silver-100 group-hover:tdk-text-night-800 tdk-transition-colors"
            />
            Wallet
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
