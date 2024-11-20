import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";
import { UserDisplayName } from "../user/UserDisplayName";

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
        <UserDisplayName address={address} tag={tag} />
      </span>
    </Button>
  );
};
