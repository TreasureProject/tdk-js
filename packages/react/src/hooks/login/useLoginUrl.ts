import { useTreasure } from "../../context";

export const useLoginUrl = () => {
  const { project, chainId = 42161, authConfig } = useTreasure();
  const loginDomain = authConfig?.loginDomain ?? "https://login.treasure.lol";
  const redirectUri = authConfig?.redirectUri ?? window.location.href;
  return `${loginDomain}/${project}?redirect_uri=${redirectUri}&chain_id=${chainId}`;
};
