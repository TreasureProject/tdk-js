import { useState } from "react";

import { TreasureIcon } from "../../icons/TreasureIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";

type Props = {
  legacyProfiles: {
    id: string;
    tag: string | null;
    discriminant: number | null;
    pfp: string | null;
    banner: string | null;
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
  onCancel,
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
          Migrate your account
        </h2>
        <p className="tdk-text-sm tdk-text-silver">
          {legacyProfiles.length > 1 ? (
            <>
              We found the following matching profiles from the Treasure Market.
              Please select one you would like to merge with your Treasure
              Account and use as your identity across the Treasure ecosystem:
            </>
          ) : (
            <>
              We found the following matching profile from the Treasure Market.
              Would you like to merge it with your Treasure Account and use it
              as your identity across the Treasure ecosystem?
            </>
          )}
        </p>
      </div>
      <div className="tdk-flex tdk-items-center tdk-gap-3 tdk-flex-wrap">
        {legacyProfiles.map(({ id, tag, discriminant, pfp, banner }) => (
          <button
            key={id}
            type="button"
            className={cn(
              "tdk-relative tdk-px-4 tdk-py-2.5 tdk-rounded-lg tdk-overflow-hidden tdk-bg-night-500 tdk-border-2 tdk-border-solid tdk-border-night-200 tdk-text-left",
              legacyProfiles.length > 1 &&
                "tdk-cursor-pointer hover:tdk-border-night-100",
              legacyProfiles.length > 1 &&
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
            <div className="tdk-relative">
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
              <div className="tdk-flex tdk-items-center tdk-gap-0.5">
                <TreasureIcon
                  className="tdk-w-7 tdk-h-7 tdk-text-transparent"
                  starsFill="#C62222"
                />
                <span className="tdk-font-semibold tdk-text-cream">{tag}</span>
                {""}
                <span className="tdk-text-silver-500">
                  #{discriminant?.toString().padStart(4, "0")}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {error ? (
        <p className="tdk-bg-ruby-200 tdk-border tdk-border-ruby-800 tdk-text-ruby-800 tdk-px-3 tdk-py-2 tdk-rounded-md">
          {error}
        </p>
      ) : null}
      <div className="tdk-flex tdk-items-center tdk-gap-2">
        <Button
          disabled={!selectedProfileId}
          onClick={
            selectedProfileId ? () => onApprove(selectedProfileId) : undefined
          }
        >
          Migrate
        </Button>
        <Button variant="secondary" onClick={onReject}>
          Skip
        </Button>
        <Button variant="tertiary" onClick={onCancel}>
          Ask me later
        </Button>
      </div>
    </div>
  );
};
