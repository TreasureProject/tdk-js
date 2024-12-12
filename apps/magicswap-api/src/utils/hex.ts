export const uint8ArrayToHexString = (arr: Uint8Array) =>
  `0x${Buffer.from(arr).toString("hex")}`;

export const hexStringToUint8Array = (hex: string) =>
  new Uint8Array(Buffer.from(hex.slice(2), "hex"));
