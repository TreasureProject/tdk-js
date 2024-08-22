import type { User } from "@treasure-dev/tdk-core";
import type { ButtonHTMLAttributes } from "react";
import { shortenAddress } from "thirdweb/utils";

import { TreasureSparklesIcon } from "../../icons/TreasureSparklesIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  user: User;
};

export const ConnectButtonAuthenticatedView = ({
  user,
  className,
  ...buttonProps
}: Props) => {
  return (
    <Button
      variant="tertiary"
      className={cn(
        "tdk-px-2 tdk-flex tdk-items-center tdk-gap-1.5 tdk-bg-night-700 tdk-border-night-500",
        className,
      )}
      {...buttonProps}
    >
      {/* <span className="tdk-w-6 tdk-h-6 tdk-bg-ruby tdk-rounded-md" /> */}
      <span className="tdk-flex tdk-items-center tdk-gap-1">
        <TreasureSparklesIcon className="tdk-w-3.5 tdk-h-3.5 tdk-text-ruby" />
        {shortenAddress(user.address)}
      </span>
    </Button>
  );
};
