import { useTranslation } from "react-i18next";

import { useLoginUrl } from "../../hooks/login/useLoginUrl";
import { MagicStarsIcon } from "../../icons/MagicStarsIcon";
import { Button } from "../ui/Button";

type Props = {
  data?: string;
};

export const TreasureLoginButton = (props?: Props) => {
  const { t } = useTranslation();
  const loginUrl = useLoginUrl({ data: props?.data });
  return (
    <Button
      as="link"
      href={loginUrl}
      className="tdk-inline-flex tdk-items-center tdk-gap-1"
    >
      <MagicStarsIcon className="tdk-w-4 tdk-h-4" />
      {t("login.action")}
    </Button>
  );
};
