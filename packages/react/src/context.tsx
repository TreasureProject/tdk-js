import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TreasureClient } from "@treasure/core";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type State = {
  client: TreasureClient;
};

const Context = createContext({} as State);

const queryClient = new QueryClient();

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
  projectId?: string;
  children: ReactNode;
};

export const TreasureProvider = ({ projectId, children }: Props) => {
  const [client] = useState<TreasureClient>(new TreasureClient(projectId));

  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider
        value={{
          client,
        }}
      >
        {children}
      </Context.Provider>
    </QueryClientProvider>
  );
};
