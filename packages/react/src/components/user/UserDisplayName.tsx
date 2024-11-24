import { shortenAddress } from "thirdweb/utils";

import { TreasureSparklesIcon } from "../../icons/TreasureSparklesIcon";
import { cn } from "../../utils/classnames";

type Props = {
  address: string;
  tag?: string | null;
  className?: string;
};

export const UserDisplayName = ({ address, tag, className }: Props) => (
  <span className={cn("tdk-flex tdk-items-center tdk-gap-1", className)}>
    {tag ? (
      <TreasureSparklesIcon className="tdk-w-3.5 tdk-h-3.5 tdk-text-ruby" />
    ) : null}
    <span className={cn("tdk-text-cream", !!tag && "tdk-font-medium")}>
      {tag ?? shortenAddress(address)}
    </span>
  </span>
);
