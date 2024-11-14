import { useState } from "react";
import { shortenAddress } from "thirdweb/utils";

import { TreasureSparklesIcon } from "../../icons/TreasureSparklesIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";

type Props = {
  legacyProfiles: {
    id: string;
    tag: string | null;
    discriminant: number | null;
    pfp: string | null;
    banner: string | null;
    legacyAddress: string;
  }[];
  error?: string;
  onApprove: (id: string) => void;
  onReject: () => void;
  onCancel: () => void;
};

export const ConnectMigrateUserView = ({
  legacyProfiles,
  error,
  onApprove,
  onReject,
}: Props) => {
  const [selectedProfileId, setSelectedProfileId] = useState(
    legacyProfiles[0]?.id,
  );
  return (
    <div className="tdk-bg-night tdk-p-8 tdk-font-sans tdk-space-y-6">
      <div className="tdk-space-y-2">
        {/* biome-ignore lint/a11y/useHeadingContent: screen reader title is in ConnectModal */}
        <h2
          className="tdk-text-lg tdk-font-semibold tdk-text-white tdk-m-0"
          aria-hidden="true"
        >
          Migrate existing accounts
        </h2>
        <p className="tdk-text-sm tdk-text-silver">
          It looks like you have several existing Treasure profiles! Please
          choose one you would like to use moving forward as your identity
          across the Treasure ecosystem.
        </p>
      </div>
      <div className="tdk-flex tdk-items-center tdk-gap-3 tdk-flex-wrap">
        {legacyProfiles.map(
          ({ id, tag, discriminant, pfp, banner, legacyAddress }) => (
            <button
              key={id}
              type="button"
              className={cn(
                "tdk-relative tdk-px-4 tdk-py-2.5 tdk-rounded-lg tdk-overflow-hidden tdk-cursor-pointer tdk-bg-night-500 tdk-border-2 tdk-border-solid tdk-border-night-200 hover:tdk-border-night-100 tdk-text-left",
                id === selectedProfileId &&
                  "tdk-border-ruby-500/60 hover:tdk-border-ruby-500/60 tdk-shadow",
              )}
              onClick={() => setSelectedProfileId(id)}
            >
              {banner ? (
                <div className="tdk-absolute tdk-inset-0">
                  <img
                    src={banner}
                    alt=""
                    className="tdk-w-full tdk-h-full tdk-object-cover tdk-rounded-t-lg"
                  />
                  <div className="tdk-absolute tdk-inset-0 tdk-bg-gradient-to-b tdk-from-transparent tdk-to-night-1000/90" />
                </div>
              ) : null}
              <div className="tdk-relative tdk-space-y-1.5">
                <img
                  src={
                    pfp ??
                    "https://images.treasure.lol/tdk/login/treasure_icon.png"
                  }
                  alt=""
                  className={cn(
                    "tdk-w-12 tdk-h-12 tdk-rounded-md tdk-border tdk-border-solid tdk-border-night-200",
                    !pfp && "tdk-opacity-60",
                  )}
                />
                {tag && discriminant !== null ? (
                  <div className="tdk-flex tdk-items-center tdk-gap-0.5">
                    <TreasureSparklesIcon className="tdk-w-4 tdk-h-4 tdk-text-ruby" />
                    <span className="tdk-font-semibold tdk-text-cream">
                      {tag}
                    </span>
                    <span className="tdk-text-silver-500">
                      #{discriminant.toString().padStart(4, "0")}
                    </span>
                  </div>
                ) : (
                  <div className="tdk-text-silver-500 tdk-font-medium">
                    {shortenAddress(legacyAddress)}
                  </div>
                )}
              </div>
            </button>
          ),
        )}
      </div>
      {error ? (
        <p className="tdk-bg-ruby-200 tdk-border tdk-border-ruby-800 tdk-text-ruby-800 tdk-px-3 tdk-py-2 tdk-rounded-md">
          {error}
        </p>
      ) : null}
      <div className="tdk-space-y-2">
        <div className="tdk-flex tdk-items-center tdk-gap-2">
          <Button
            disabled={!selectedProfileId}
            onClick={
              selectedProfileId ? () => onApprove(selectedProfileId) : undefined
            }
          >
            Use this account
          </Button>
          <Button variant="secondary" onClick={onReject}>
            Start fresh
          </Button>
        </div>
        <p className="tdk-text-xs tdk-text-silver-600">
          NOTE: This is irreversible, so please choose carefully.
        </p>
      </div>
    </div>
  );
};
