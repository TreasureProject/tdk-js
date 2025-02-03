import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

import { UserAvatar } from "../User/UserAvatar";
import { UserDisplayName } from "../User/UserDisplayName";

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
    <button
      type="button"
      className={clsx(
        "tdk-min-h-9 tdk-flex tdk-items-center tdk-gap-1.5 tdk-px-2 tdk-py-1 tdk-rounded-lg tdk-text-sm tdk-text-cream tdk-bg-night-700 tdk-border tdk-border-solid tdk-border-night-500 hover:tdk-border-night-200 hover:tdk-bg-night-300 active:tdk-border-night-400 active:tdk-bg-night-600 tdk-transition-colors",
        className,
      )}
      {...buttonProps}
    >
      <UserAvatar
        address={address}
        pfp={pfp}
        className="tdk-w-6 tdk-h-6 tdk-rounded-lg"
      />
      <UserDisplayName address={address} tag={tag} />
    </button>
  );
};
