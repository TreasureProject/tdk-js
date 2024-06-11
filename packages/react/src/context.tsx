import {
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  TDKAPI,
} from "@treasure-dev/tdk-core";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";
import {
  type ThirdwebClient,
  createThirdwebClient,
  defineChain,
} from "thirdweb";
import type { Chain as ThirdwebChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

type Config = {
  clientId: string;
  project: string;
  chainId?: number;
  apiUri?: string;
};

type ContextValues = {
  tdk: TDKAPI;
  thirdwebClient: ThirdwebClient;
  thirdwebChain: ThirdwebChain;
};

const Context = createContext({} as ContextValues);

export const useTreasure = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "Must call `useTreasure` within a `TreasureProvider` component.",
    );
  }

  return context;
};

type Props = PropsWithChildren<Config>;

export const TreasureProvider = ({ children, ...config }: Props) => {
  const {
    clientId,
    project: projectId,
    chainId: rawChainId = DEFAULT_TDK_CHAIN_ID,
    apiUri = DEFAULT_TDK_API_BASE_URI,
  } = config;

  const chainId = Number(rawChainId);

  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: apiUri,
        project: projectId,
        chainId,
      }),
    [apiUri, chainId, projectId],
  );

  return (
    <ThirdwebProvider>
      <Context.Provider
        value={{
          tdk,
          thirdwebClient: useMemo(
            () => createThirdwebClient({ clientId }),
            [clientId],
          ),
          thirdwebChain: useMemo(() => defineChain(chainId), [chainId]),
        }}
      >
        {children}
      </Context.Provider>
    </ThirdwebProvider>
  );
};
