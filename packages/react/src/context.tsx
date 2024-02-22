import { TDKAPI } from "@treasure/tdk-api";
import { TreasureClient } from "@treasure/tdk-core";
import { jwtDecode } from "jwt-decode";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "./utils/store";

type Config = {
  project: string;
  chainId?: number;
  apiUri?: string;
  authConfig?: {
    loginDomain: string;
    redirectUri: string;
  };
};

type State = Config & {
  status: "IDLE" | "AUTHENTICATING" | "AUTHENTICATED";
  client: TreasureClient;
  tdk?: TDKAPI;
  authToken?: string;
};

type ContextValues = {
  address?: string;
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
    case "COMPLETE_AUTH":
      setStoredAuthToken(action.authToken);
      state.tdk?.setAuthToken(action.authToken);
      return {
        ...state,
        status: action.authToken ? "AUTHENTICATED" : "IDLE",
        authToken: action.authToken,
      };
    case "RESET_AUTH":
      clearStoredAuthToken();
      state.tdk?.clearAuthToken();
      return {
        ...state,
        status: "IDLE",
        authToken: undefined,
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
  const { project = "platform" } = config;
  const [state, dispatch] = useReducer(reducer, {
    ...config,
    status: "IDLE",
    project,
    client: new TreasureClient(project),
    tdk: config.apiUri
      ? new TDKAPI({
          baseUri: config.apiUri,
          projectId: project,
          chainId: config.chainId,
        })
      : undefined,
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
      const { exp } = jwtDecode<{ exp?: number }>(authToken);
      if (!exp || exp * 1000 > Date.now()) {
        dispatch({ type: "COMPLETE_AUTH", authToken });
      } else {
        clearStoredAuthToken();
      }
    }
  }, []);

  const address = useMemo(() => {
    if (!state.authToken) {
      return undefined;
    }

    return jwtDecode<{ sub: string }>(state.authToken).sub;
  }, [state.authToken]);

  return (
    <Context.Provider
      value={{
        ...state,
        address,
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
