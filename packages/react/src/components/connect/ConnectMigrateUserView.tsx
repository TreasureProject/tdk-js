import type { LegacyProfile } from "@treasure-dev/tdk-core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ZERO_ADDRESS } from "thirdweb";
import { shortenAddress } from "thirdweb/utils";

import { TreasureSparklesIcon } from "../../icons/TreasureSparklesIcon";
import { cn } from "../../utils/classnames";
import { Button } from "../ui/Button";

type Props = {
  legacyProfiles: LegacyProfile[];
  isLoading?: boolean;
  error?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export const ConnectMigrateUserView = ({
  legacyProfiles,
  isLoading = false,
  error,
  onApprove,
  onReject,
}: Props) => {
  const [selectedProfileId, setSelectedProfileId] = useState(
    legacyProfiles[0]?.id,
  );
  const { t } = useTranslation();
  return (
    <div className="tdk-bg-night tdk-p-8 tdk-font-sans tdk-space-y-6">
      <div className="tdk-space-y-2">
        {/* biome-ignore lint/a11y/useHeadingContent: screen reader title is in ConnectModal */}
        <h2
          className="tdk-text-lg tdk-font-semibold tdk-text-white tdk-m-0"
          aria-hidden="true"
        >
          {t("connect.migrate.header")}
        </h2>
        <p className="tdk-text-sm tdk-text-silver">
          {t("connect.migrate.description")}
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
                    {shortenAddress(legacyAddress ?? ZERO_ADDRESS)}
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
            disabled={!selectedProfileId || isLoading}
            onClick={
              selectedProfileId ? () => onApprove(selectedProfileId) : undefined
            }
          >
            {t("connect.migrate.approve")}
          </Button>
          <Button
            variant="secondary"
            disabled={!selectedProfileId || isLoading}
            onClick={
              selectedProfileId ? () => onReject(selectedProfileId) : undefined
            }
          >
            {t("connect.migrate.reject")}
          </Button>
        </div>
        <p className="tdk-text-xs tdk-text-silver-600">
          {t("connect.migrate.disclaimer")}
        </p>
      </div>
    </div>
  );
};
