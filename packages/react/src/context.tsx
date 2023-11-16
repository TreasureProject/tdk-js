import { TreasureClient } from "@treasure/tdk-core";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

type State = {
  status: "IDLE" | "AUTHENTICATING" | "AUTHENTICATED";
  project: string;
  client: TreasureClient;
  authToken?: string;
};

type ContextValues = {
  address?: string;
  onStartAuth: () => void;
  onCompleteAuth: (authToken: string) => void;
  logOut: () => void;
};

const Context = createContext({} as State & ContextValues);

type Action =
  | { type: "START_AUTH" }
  | { type: "COMPLETE_AUTH"; authToken: string }
  | { type: "RESET_AUTH" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_AUTH":
      return {
        ...state,
        status: "AUTHENTICATING",
      };
    case "COMPLETE_AUTH":
      localStorage.setItem("tdk_auth_token", action.authToken);
      return {
        ...state,
        status: action.authToken ? "AUTHENTICATED" : "IDLE",
        authToken: action.authToken,
      };
    case "RESET_AUTH":
      localStorage.removeItem("tdk_auth_token");
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

type Props = {
  project: string;
  children: ReactNode;
};

export const TreasureProvider = ({ project = "platform", children }: Props) => {
  const [state, dispatch] = useReducer(reducer, {
    status: "IDLE",
    project,
    client: new TreasureClient(project),
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
      authToken = localStorage.getItem("tdk_auth_token");
    }

    // Mark as logged in if we have a match
    if (authToken) {
      dispatch({ type: "COMPLETE_AUTH", authToken });
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
