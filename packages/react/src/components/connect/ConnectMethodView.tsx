import type { ConnectMethod } from "@treasure-dev/tdk-core";
import { type ButtonHTMLAttributes, useState } from "react";

import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ConnectFooter } from "./ConnectFooter";

type Props = {
  appName: string;
  appIconUri?: string;
  onConnect: (method: ConnectMethod, email?: string) => void;
};

export const ConnectMethodView = ({
  appName,
  appIconUri = "https://images.treasure.lol/tdk/login/treasure_icon.png",
  onConnect,
}: Props) => {
  const [email, setEmail] = useState("");
  return (
    <div className="tdk-bg-night-1100 tdk-p-8 tdk-text-night-100 tdk-font-sans tdk-space-y-6">
      <div className="tdk-flex tdk-items-center tdk-gap-3">
        <div className="tdk-w-12 tdk-h-12 tdk-bg-night-900 tdk-rounded-lg tdk-overflow-hidden">
          <img src={appIconUri} alt="" className="tdk-w-full tdk-h-full" />
        </div>
        <div>
          <span className="tdk-text-sm tdk-text-[#9DA3AB] tdk-block">
            Connect to
          </span>
          <span className="tdk-text-base tdk-block tdk-font-semibold">
            {appName}
          </span>
        </div>
      </div>
      <div className="tdk-space-y-6">
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
            className="tdk-w-full tdk-rounded-lg tdk-border tdk-border-solid tdk-border-night-900 tdk-bg-[#0C1D31] tdk-px-3 tdk-py-2.5 tdk-text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          className="tdk-w-full tdk-font-medium"
          onClick={() => onConnect("email", email)}
        >
          Connect
        </Button>
      </div>
      <div className="tdk-relative tdk-flex tdk-items-center tdk-justify-center">
        <div className="tdk-h-[1px] tdk-bg-[#10263E] tdk-absolute tdk-left-0 tdk-right-0 tdk-z-0" />
        <span className="tdk-text-sm tdk-text-[#6E747F] tdk-px-4 tdk-uppercase tdk-bg-night-1100 tdk-z-10">
          or
        </span>
      </div>
      <div className="tdk-grid tdk-grid-cols-5 tdk-gap-2">
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("google")}
        >
          <Icon
            name="google"
            className="tdk-w-6 tdk-h-6 tdk-text-[#E7E8E9] group-hover:tdk-text-[#071727] tdk-transition-colors"
          />
          <span className="tdk-block">Google</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("telegram")}
        >
          <Icon
            name="telegram"
            className="tdk-w-6 tdk-h-6 tdk-text-[#E7E8E9] group-hover:tdk-text-[#071727] tdk-transition-colors"
          />
          <span className="tdk-block">Telegram</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("discord")}
        >
          <Icon
            name="discord"
            className="tdk-w-6 tdk-h-6 tdk-text-[#E7E8E9] group-hover:tdk-text-[#071727] tdk-transition-colors"
          />
          <span className="tdk-block">Discord</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("apple")}
        >
          <Icon
            name="apple"
            className="tdk-w-6 tdk-h-6 tdk-text-[#E7E8E9] group-hover:tdk-text-[#071727] tdk-transition-colors"
          />
          <span className="tdk-block">Apple</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group"
          onClick={() => onConnect("passkey")}
        >
          <Icon
            name="passkey"
            className="tdk-w-6 tdk-h-6 tdk-text-[#E7E8E9] group-hover:tdk-text-[#071727] tdk-transition-colors"
          />
          <span className="tdk-block">Passkey</span>
        </ConnectMethodButton>
        <ConnectMethodButton
          className="tdk-group tdk-col-span-5 tdk-flex tdk-items-center tdk-gap-1 tdk-justify-center tdk-py-2"
          onClick={() => onConnect("wallet")}
        >
          <Icon
            name="wallet"
            className="tdk-w-6 tdk-h-6 tdk-text-[#E7E8E9] group-hover:tdk-text-[#071727] tdk-transition-colors"
          />
          Wallet
        </ConnectMethodButton>
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
        "tdk-bg-[#10263E] tdk-border tdk-border-solid tdk-border-[#152E49] tdk-p-3 tdk-text-xs tdk-text-[#E7E8E9] tdk-font-medium tdk-cursor-pointer hover:tdk-bg-[#FFFCF3] hover:tdk-border-[#FFFCF3] tdk-transition-colors hover:tdk-text-[#071727] tdk-rounded-lg",
        className,
      )}
      {...props}
    />
  );
};
