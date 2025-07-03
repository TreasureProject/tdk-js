import { describe, expect, it } from "vitest";

import { parseThirdwebUserLinkedAccounts } from "./user";

const EMAIL = "rappzula@treasure.lol";
const EMAIL2 = "rappzula+2@treasure.lol";
const EXTERNAL_WALLET_ADDRESS = "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826";
const EXTERNAL_WALLET_ADDRESS2 = "0xAe41952DF7e8C8d7798F10c15C0b19ab98e4Fe1A";
const ECOSYSTEM_WALLET_ADDRESS = "0xc292b6155baeb5ccdba82e3d36ecb7ad0a121baa";

describe("user utils", () => {
  it("should parse thirdweb user email", () => {
    const result = parseThirdwebUserLinkedAccounts({
      userId: "thirdweb-user-id",
      walletAddress: ECOSYSTEM_WALLET_ADDRESS,
      email: EMAIL,
      createdAt: "",
      profiles: [],
    });
    expect(result.emailAddresses).toStrictEqual([EMAIL]);
    expect(result.externalWalletAddresses).toStrictEqual([]);
  });

  it("should parse thirdweb user profiles", () => {
    const result = parseThirdwebUserLinkedAccounts({
      userId: "thirdweb-user-id",
      walletAddress: ECOSYSTEM_WALLET_ADDRESS,
      createdAt: "",
      profiles: [
        {
          type: "email",
          details: {
            email: EMAIL,
          },
        },
        {
          type: "google",
          details: {
            email: EMAIL2,
          },
        },
        {
          // @ts-ignore: Thirdweb SDK has a type mismatch bug here as of v5.72.0
          type: "siwe",
          details: {
            address: EXTERNAL_WALLET_ADDRESS,
          },
        },
        {
          type: "wallet",
          details: {
            address: EXTERNAL_WALLET_ADDRESS2,
          },
        },
      ],
    });
    expect(result.emailAddresses).toStrictEqual([EMAIL, EMAIL2]);
    expect(result.externalWalletAddresses).toStrictEqual([
      EXTERNAL_WALLET_ADDRESS.toLowerCase(),
      EXTERNAL_WALLET_ADDRESS2.toLowerCase(),
    ]);
  });

  it("should handle parsing empty thirdweb user", () => {
    const result = parseThirdwebUserLinkedAccounts(null);
    expect(result.emailAddresses).toStrictEqual([]);
    expect(result.externalWalletAddresses).toStrictEqual([]);
  });
});
