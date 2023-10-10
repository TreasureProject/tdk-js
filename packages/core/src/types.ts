import type { TransactionReceipt } from "viem";

export type AddressString = `0x${string}`;

export type OnSuccessFn = (data?: TransactionReceipt) => void;
export type OnErrorFn = (error?: Error) => void;

export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";
