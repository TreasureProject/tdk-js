export const base64 = (value: string | Uint8Array) =>
  Buffer.from(value).toString("base64");

export const base64url = (value: string | Uint8Array) =>
  base64(value).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
