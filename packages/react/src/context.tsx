import {
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_LOGIN_DOMAIN,
  type ProjectSlug,
  TDKAPI,
  decodeAuthToken,
} from "@treasure-dev/tdk-core";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useReducer } from "react";

import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "./utils/store";

type Config = {
  project: ProjectSlug;
  chainId?: number;
  apiUri?: string;
  authConfig?: {
    loginDomain?: string;
    redirectUri?: string;
  };
};

type State = {
  project: ProjectSlug;
  chainId: number;
  apiUri: string;
  authConfig: {
    loginDomain: string;
    redirectUri: string;
  };
  status: "IDLE" | "AUTHENTICATING" | "AUTHENTICATED";
  tdk: TDKAPI;
  isAuthenticated: boolean;
  authToken?: string;
  address?: string;
  account?: {
    email: string;
  };
};

type ContextValues = {
  onStartAuth: () => void;
  onCompleteAuth: (authToken: string) => void;
  logOut: () => void;
};

type Action =
  | { type: "START_AUTH" }
  | { type: "COMPLETE_AUTH"; authToken: string }
  | { type: "RESET_AUTH" };

const Context = createContext({} as State & ContextValues);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_AUTH":
      return {
        ...state,
        status: "AUTHENTICATING",
      };
    case "COMPLETE_AUTH": {
      setStoredAuthToken(action.authToken);
      state.tdk.setAuthToken(action.authToken);
      const decodedAuthToken = decodeAuthToken(action.authToken);
      return {
        ...state,
        status: "AUTHENTICATED",
        isAuthenticated: true,
        authToken: action.authToken,
        address: decodedAuthToken.sub,
        account: decodedAuthToken.ctx,
      };
    }
    case "RESET_AUTH":
      clearStoredAuthToken();
      state.tdk.clearAuthToken();
      return {
        ...state,
        status: "IDLE",
        isAuthenticated: false,
        authToken: undefined,
        address: undefined,
        account: undefined,
      };
  }
};

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
    project = DEFAULT_TDK_APP,
    chainId = DEFAULT_TDK_CHAIN_ID,
    apiUri = DEFAULT_TDK_API_BASE_URI,
    authConfig,
  } = config;
  const {
    loginDomain = DEFAULT_TDK_LOGIN_DOMAIN,
    redirectUri = window.location.href,
  } = authConfig ?? {};
  const [state, dispatch] = useReducer(reducer, {
    project,
    chainId,
    apiUri,
    authConfig: {
      loginDomain,
      redirectUri,
    },
    status: "IDLE",
    tdk: new TDKAPI({
      baseUri: config.apiUri,
      project,
      chainId: config.chainId,
    }),
    isAuthenticated: false,
  });

  useEffect(() => {
    let authToken: string | null | undefined;

    // Check browser query params
    if (window.location.search) {
      authToken = new URLSearchParams(window.location.search).get(
        "tdk_auth_token",
      );
    }

    // Check local storage
    if (!authToken) {
      authToken = getStoredAuthToken();
    }

    // Mark as logged in if we have a valid match
    if (authToken) {
      const exp = decodeAuthToken(authToken).exp ?? 0;
      if (exp * 1000 > Date.now()) {
        dispatch({ type: "COMPLETE_AUTH", authToken });
      } else {
        clearStoredAuthToken();
      }
    }
  }, []);

  return (
    <Context.Provider
      value={{
        ...state,
        onStartAuth: () => dispatch({ type: "START_AUTH" }),
        onCompleteAuth: (authToken) =>
          dispatch({ type: "COMPLETE_AUTH", authToken }),
        logOut: () => dispatch({ type: "RESET_AUTH" }),
      }}
    >
      {children}
    </Context.Provider>
  );
};
