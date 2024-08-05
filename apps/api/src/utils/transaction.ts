import * as Sentry from "@sentry/node";
import type { Engine } from "@thirdweb-dev/engine";
import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";

import type { TransactionArguments, TransactionOverrides } from "../schema";

export const writeTransaction = async <
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<
    TAbi,
    "nonpayable" | "payable"
  > = string,
>({
  engine,
  chainId,
  contractAddress,
  backendWallet,
  smartAccountAddress,
  functionName,
  args,
  txOverrides,
  simulateTransaction = false,
  idempotencyKey,
  ...rest
}: {
  engine: Engine;
  chainId: number;
  contractAddress: string;
  backendWallet: string;
  smartAccountAddress: string;
  txOverrides?: TransactionOverrides;
  simulateTransaction?: boolean;
  idempotencyKey?: string;
} & (
  | {
      abi: TAbi;
      functionName: TFunctionName;
      args: AbiParametersToPrimitiveTypes<
        ExtractAbiFunction<TAbi, TFunctionName>["inputs"],
        "inputs"
      >;
    }
  | {
      functionName: string;
      args: TransactionArguments | Readonly<TransactionArguments>;
    }
)) => {
  const abi = "abi" in rest ? rest.abi : undefined;
  Sentry.setExtra(
    "transaction",
    JSON.stringify(
      {
        contractAddress,
        functionName,
        abi: !!abi,
        args,
      },
      null,
      2,
    ),
  );
  const { result } = await engine.contract.write(
    chainId.toString(),
    contractAddress,
    backendWallet,
    {
      // @ts-ignore: stronger type-checking than Engine
      abi,
      functionName,
      // @ts-ignore: stronger type-checking than Engine
      args,
      txOverrides,
    },
    simulateTransaction,
    idempotencyKey,
    smartAccountAddress,
  );
  return result;
};
