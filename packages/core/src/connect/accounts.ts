import { type Config, readContracts } from "@wagmi/core";
import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";

import { managedAccountAbi } from "../abis/managedAccountAbi";
import type { AddressString, SupportedChainId } from "../types";
import { DEFAULT_WAGMI_CONFIG } from "../utils/wagmi";

type Signer = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<
    typeof managedAccountAbi,
    "getAllActiveSigners"
  >["outputs"],
  "outputs"
>[0][number] & {
  isAdmin: boolean;
};

export const getAllActiveSigners = async ({
  chainId,
  address,
  wagmiConfig = DEFAULT_WAGMI_CONFIG,
}: {
  chainId: SupportedChainId;
  address: string;
  wagmiConfig?: Config;
}): Promise<Signer[]> => {
  const [{ result: allActiveSigners = [] }, { result: allAdmins = [] }] =
    await readContracts(wagmiConfig, {
      contracts: [
        {
          chainId,
          address: address as AddressString,
          abi: managedAccountAbi,
          functionName: "getAllActiveSigners",
        },
        {
          chainId,
          address: address as AddressString,
          abi: managedAccountAbi,
          functionName: "getAllAdmins",
        },
      ],
    });
  return [
    ...allActiveSigners.map((activeSigner) => ({
      ...activeSigner,
      isAdmin: allAdmins.includes(activeSigner.signer),
      signer: activeSigner.signer as AddressString,
      approvedTargets: activeSigner.approvedTargets.map(
        (target) => target as AddressString,
      ),
    })),
    ...allAdmins.map((adminAddress) => ({
      isAdmin: true,
      signer: adminAddress as AddressString,
      approvedTargets: [],
      nativeTokenLimitPerTransaction: 0n,
      startTimestamp: 0n,
      // Date in the distant future because admins don't expire until they're explicitly removed
      endTimestamp: BigInt(
        Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 10,
      ),
    })),
  ];
};
