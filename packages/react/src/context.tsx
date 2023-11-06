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
};

const Context = createContext({} as State & ContextValues);

type Action =
  | { type: "START_AUTH" }
  | { type: "COMPLETE_AUTH"; authToken: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_AUTH":
      return {
        ...state,
        status: "AUTHENTICATING",
      };
    case "COMPLETE_AUTH":
      return {
        ...state,
        status: action.authToken ? "AUTHENTICATED" : "IDLE",
        authToken: action.authToken,
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
    if (window.location.search) {
      const authToken = new URLSearchParams(window.location.search).get(
        "tdk_auth_token",
      );
      if (authToken) {
        dispatch({ type: "COMPLETE_AUTH", authToken });
      }
    }
  }, []);

  const address = useMemo(() => {
    if (!state.authToken) {
      return undefined;
    }

    return jwtDecode<{ address: string }>(state.authToken).address;
  }, [state.authToken]);

  return (
    <Context.Provider
      value={{
        ...state,
        address,
        onStartAuth: () => dispatch({ type: "START_AUTH" }),
        onCompleteAuth: (authToken) =>
          dispatch({ type: "COMPLETE_AUTH", authToken }),
      }}
    >
      {children}
    </Context.Provider>
  );
};
