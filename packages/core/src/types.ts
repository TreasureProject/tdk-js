export type AddressString = `0x${string}`;

export type OnSuccessFn = () => void;
export type OnErrorFn = (error?: Error) => void;

export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";
