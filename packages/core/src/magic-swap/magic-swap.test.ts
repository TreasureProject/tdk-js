import { describe, expect, it } from "vitest";
import { arbitrumSepolia } from "viem/chains";

import { fetchPools } from "./index";

describe("magic-swap", () => {
  it.only("should fetch pairs", async () => {
    console.log("test", process.env);
    const pairs = await fetchPools({
      chainId: arbitrumSepolia.id,
      inventoryApiUrl: "https://trove-api-dev.treasure.lol",
      inventoryApiKey: "oP5gtcE5Mb1vAoBz2J5Ad",
    });

    expect(pairs.length).toBeGreaterThan(0);
  }, 100000);
});
