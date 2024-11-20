import type { ButtonHTMLAttributes } from "react";
import { shortenAddress } from "thirdweb/utils";

import { TreasureSparklesIcon } from "../../icons/TreasureSparklesIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  address: string;
  pfp?: string | null;
  tag?: string | null;
};

export const ConnectButtonAuthenticatedView = ({
  address,
  pfp,
  tag,
  className,
  ...buttonProps
}: Props) => {
  return (
    <Button
      variant="tertiary"
      className={cn(
        "tdk-px-2 tdk-flex tdk-items-center tdk-gap-1.5 tdk-bg-night-700 tdk-border tdk-border-night-500",
        className,
      )}
      {...buttonProps}
    >
      <span className="tdk-flex tdk-items-center tdk-gap-1.5">
        {pfp ? (
          <img src={pfp} alt="" className="tdk-w-6 tdk-h-6 tdk-rounded-lg" />
        ) : null}
        <span className="tdk-flex tdk-items-center tdk-gap-1">
          <TreasureSparklesIcon className="tdk-w-3.5 tdk-h-3.5 tdk-text-ruby" />
          <span
            className={cn(
              "tdk-text-cream",
              tag ? "tdk-font-medium" : "tdk-tabular-nums",
            )}
          >
            {tag ?? shortenAddress(address)}
          </span>
        </span>
      </span>
    </Button>
  );
};
