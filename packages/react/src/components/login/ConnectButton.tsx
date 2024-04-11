import { truncateEthAddress } from "@treasure-dev/tdk-core";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "usehooks-ts";

import { useTreasure } from "../../context";
import { useLoginUrl } from "../../hooks/login/useLoginUrl";
import { CopyIcon } from "../../icons/CopyIcon";
import { ExitIcon } from "../../icons/ExitIcon";
import { TreasureIcon } from "../../icons/TreasureIcon";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";

type Props = {
  data?: string;
};

export const ConnectButton = (props?: Props) => {
  const { isAuthenticated, address, account, logOut } = useTreasure();
  const loginUrl = useLoginUrl({ data: props?.data });
  const { t } = useTranslation();
  const [, copy] = useCopyToClipboard();

  return isAuthenticated ? (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="tdk-p-3 tdk-bg-[#FFFCF3] tdk-flex tdk-items-center tdk-justify-between tdk-gap-5 hover:tdk-bg-honey-400 tdk-transition-colors tdk-rounded-xl tdk-text-left focus:tdk-outline-none">
            <div>
              <span className="tdk-text-sm tdk-text-[#0A111C] tdk-font-medium block">
                {account?.email}
              </span>
              <span className="tdk-text-xs tdk-text-night-600 block">
                {truncateEthAddress(address)}
              </span>
            </div>
            <TreasureIcon className="tdk-w-8 tdk-h-8 tdk-text-ruby-900" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="tdk-w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuItem>
            <button
              className="tdk-flex tdk-items-center tdk-gap-1 tdk-w-full"
              onClick={() => copy(address ?? "")}
            >
              <CopyIcon className="tdk-w-5 tdk-h-5" />
              {t("common.copyAddress")}
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <button
              className="tdk-flex tdk-items-center tdk-gap-1 tdk-text-ruby-800 tdk-w-full"
              onClick={() => logOut()}
            >
              <ExitIcon className="tdk-w-5 tdk-h-5" />
              {t("login.disconnect")}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ) : (
    <Button
      as="link"
      href={loginUrl}
      className="tdk-inline-flex tdk-items-center tdk-gap-1"
    >
      <TreasureIcon
        className="tdk-w-5 tdk-h-5 tdk-text-white"
        starsFill="#C62222"
      />
      {t("login.connect")}
    </Button>
  );
};
