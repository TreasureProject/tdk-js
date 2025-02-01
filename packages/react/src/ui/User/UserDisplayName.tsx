import clsx from "clsx";
import { shortenAddress } from "thirdweb/utils";

import { TreasureSparklesIcon } from "../icons/TreasureSparklesIcon";

type Props = {
  address: string;
  tag?: string | null;
  className?: string;
};

export const UserDisplayName = ({ address, tag, className }: Props) => (
  <span className={clsx("tdk-flex tdk-items-center tdk-gap-1", className)}>
    {tag ? (
      <TreasureSparklesIcon className="tdk-w-3.5 tdk-h-3.5 tdk-text-ruby" />
    ) : null}
    <span className={clsx("tdk-text-cream", !!tag && "tdk-font-medium")}>
      {tag ?? shortenAddress(address)}
    </span>
  </span>
);
