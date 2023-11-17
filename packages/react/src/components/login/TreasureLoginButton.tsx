import { useTreasure } from "../../context";
import { MagicStarsIcon } from "../../icons";
import { Button } from "../ui/Button";

export const TreasureLoginButton = () => {
  const { project, chainId = 42161, authConfig } = useTreasure();
  const loginDomain = authConfig?.loginDomain ?? "https://login.treasure.lol";
  const redirectUri = authConfig?.redirectUri ?? window.location.href;
  return (
    <Button
      as="link"
      href={`${loginDomain}/${project}?redirect_uri=${redirectUri}&chain_id=${chainId}`}
      className="tdk-inline-flex tdk-items-center tdk-gap-1"
    >
      <MagicStarsIcon className="tdk-w-4 tdk-h-4" />
      Log in with Treasure
    </Button>
  );
};
