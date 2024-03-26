import { createLoginUrl } from "@treasure-dev/tdk-core";

import { useTreasure } from "../../context";

type Props = {
  data?: string;
};

export const useLoginUrl = (props?: Props) => {
  const { project, chainId, authConfig } = useTreasure();
  return createLoginUrl({
    project,
    chainId,
    domain: authConfig.loginDomain,
    redirectUri: authConfig.redirectUri,
    data: props?.data,
  });
};
