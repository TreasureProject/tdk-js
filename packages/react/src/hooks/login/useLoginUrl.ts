import { createLoginUrl } from "@treasure/tdk-core";

import { useTreasure } from "../../context";

export const useLoginUrl = () => {
  const { project, chainId, authConfig } = useTreasure();
  return createLoginUrl({
    project,
    chainId,
    domain: authConfig.loginDomain,
    redirectUri: authConfig.redirectUri,
  });
};
