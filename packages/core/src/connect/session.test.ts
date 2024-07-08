import { parseEther, zeroAddress } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateSession } from "./session";

const DATE = new Date(2024, 5, 4, 11);
const DEFAULT_SESSION = {
  isAdmin: false,
  startTimestamp: (DATE.getTime() / 1000 - 60).toString(),
  endTimestamp: (DATE.getTime() / 1000 + 7_200).toString(),
  signer: zeroAddress,
  approvedTargets: [zeroAddress],
  nativeTokenLimitPerTransaction: parseEther("1").toString(),
};

describe("session utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should validate session", async () => {
    // No approved targets required, so session is not needed
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [],
        sessions: [],
      }),
    ).toBe(true);

    // Session exists with correct signer, approved targets and native token limit
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        nativeTokenLimitPerTransaction: parseEther("1"),
        sessions: [DEFAULT_SESSION],
      }),
    ).toBe(true);

    // Session exists with admin
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        sessions: [
          {
            ...DEFAULT_SESSION,
            isAdmin: true,
            approvedTargets: [],
          },
        ],
        sessionMinDurationLeftSec: 10_800,
      }),
    ).toBe(true);

    // Session exists, but it's expired
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        sessions: [
          {
            ...DEFAULT_SESSION,
            endTimestamp: (DATE.getTime() / 1000 - 60).toString(),
          },
        ],
      }),
    ).toBe(false);

    // Session exists, but doesn't meet the minimum duration
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        sessions: [DEFAULT_SESSION],
        sessionMinDurationLeftSec: 10_800,
      }),
    ).toBe(false);

    // Session exists, but doesn't have the correct signer
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        sessions: [
          {
            ...DEFAULT_SESSION,
            signer: "0x123",
          },
        ],
      }),
    ).toBe(false);

    // Session exists, but doesn't have the correct approved targets
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        sessions: [
          {
            ...DEFAULT_SESSION,
            approvedTargets: [],
          },
        ],
      }),
    ).toBe(false);

    // Session exists, but doesn't have the correct native token limit
    expect(
      validateSession({
        backendWallet: zeroAddress,
        approvedTargets: [zeroAddress],
        nativeTokenLimitPerTransaction: parseEther("2"),
        sessions: [DEFAULT_SESSION],
      }),
    ).toBe(false);
  });
});
