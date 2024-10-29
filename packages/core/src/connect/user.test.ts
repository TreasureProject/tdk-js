import { arbitrum, arbitrumSepolia } from "thirdweb/chains";
import { describe, expect, it } from "vitest";

import { treasureTopaz } from "../constants";
import type { User } from "../types";
import { getUserAddress } from "./user";

const user = {
  smartAccounts: [
    {
      chainId: arbitrumSepolia.id,
      address: "0xa0a89db1c899c49f98e6326b764bafcf167fc2ce",
    },
    {
      chainId: treasureTopaz.id,
      address: "0xf9e197aa9fa7c3b27a1a1313cad5851b55f2fd71",
    },
  ],
} as User;

describe("user utils", () => {
  it("should get user address by chain", () => {
    expect(getUserAddress(user, arbitrumSepolia.id)).toBe(
      "0xa0a89db1c899c49f98e6326b764bafcf167fc2ce",
    );
    expect(getUserAddress(user, treasureTopaz.id)).toBe(
      "0xf9e197aa9fa7c3b27a1a1313cad5851b55f2fd71",
    );
    expect(getUserAddress(user, arbitrum.id)).toBeUndefined();
  });
});
