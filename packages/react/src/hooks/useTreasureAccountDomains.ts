import { useQuery } from "@tanstack/react-query";
import invariant from "tiny-invariant";

import { useTreasure } from "../context";

type Props = {
  address: string | undefined;
};

export const useTreasureAccountDomains = ({ address }: Props) => {
  const { client } = useTreasure();
  return useQuery({
    queryKey: ["useAccountDomains", address],
    queryFn: () => {
      invariant(address, "Account address is required");
      return client.platform.getAccountDomains(address);
    },
    enabled: Boolean(address),
  });
};
