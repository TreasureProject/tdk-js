import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAuth } from "./auth";

vi.mock("@aws-sdk/client-kms", () => ({
  KMS: vi.fn().mockReturnValue({}),
}));

vi.mock("./kms", () => ({
  kmsSign: vi
    .fn()
    .mockReturnValue(
      "h7LZlVaRkxm4gxZrKapE2j8um3N3sJ2ZsN_9eaNTZD3EPdGNNhuhicd6B6iPcWrYjWZu7cpZGYFgKiqxau2QwcEBGIkvXLYOFlufFYVVuFBYZ7hgjTUQzjJws08yLYwmxmkBo2GHSHf_N4MlNcsKNJwMZmhcQCLWd-MraXRtC4ILrPTf4lG87YdYA5JGNC6hfab4YxOpCdPg_YGyb7ggllO-MT44MS1LtSOMn72RYn4CjgX-H10e9K_3r0wTksAIfxTaC2TB1qF-q8wcqa2pj0Y7aUYp2s2fWMKwrxGeZl_vUEEbFNchVfTgInl6wCnybdgVpgs-2sRq0pf8vm3EKg",
    ),
  kmsGetPublicKey: vi.fn().mockReturnValue(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`),
}));

const PAYLOAD = {
  iss: "treasure.lol",
  sub: "engineer1",
  aud: "treasure.lol",
  exp: 1713741600,
  iat: 1713655200,
  ctx: {
    email: "engineering@treasure.lol",
  },
};

const SIGNATURE =
  "h7LZlVaRkxm4gxZrKapE2j8um3N3sJ2ZsN_9eaNTZD3EPdGNNhuhicd6B6iPcWrYjWZu7cpZGYFgKiqxau2QwcEBGIkvXLYOFlufFYVVuFBYZ7hgjTUQzjJws08yLYwmxmkBo2GHSHf_N4MlNcsKNJwMZmhcQCLWd-MraXRtC4ILrPTf4lG87YdYA5JGNC6hfab4YxOpCdPg_YGyb7ggllO-MT44MS1LtSOMn72RYn4CjgX-H10e9K_3r0wTksAIfxTaC2TB1qF-q8wcqa2pj0Y7aUYp2s2fWMKwrxGeZl_vUEEbFNchVfTgInl6wCnybdgVpgs-2sRq0pf8vm3EKg";
const JWT = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmVhc3VyZS5sb2wiLCJzdWIiOiJlbmdpbmVlcjEiLCJhdWQiOiJ0cmVhc3VyZS5sb2wiLCJleHAiOjE3MTM3NDE2MDAsImlhdCI6MTcxMzY1NTIwMCwiY3R4Ijp7ImVtYWlsIjoiZW5naW5lZXJpbmdAdHJlYXN1cmUubG9sIn19.${SIGNATURE}`;

const auth = createAuth({
  kmsKey: "arn:kms-auth-test",
  issuer: "treasure.lol",
  audience: "treasure.lol",
  expirationTimeSeconds: 86_400,
});

describe("treasure auth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 3, 20, 16, 20));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate JWT", async () => {
    const token = await auth.generateJWT("engineer1", {
      context: {
        email: "engineering@treasure.lol",
      },
    });
    expect(
      token.startsWith(
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmVhc3VyZS5sb2wiLCJ",
      ),
    ).toBe(true);
    expect(token.endsWith(SIGNATURE)).toBe(true);
  });

  it("should verify valid JWT", async () => {
    expect(await auth.verifyJWT(JWT)).toEqual(PAYLOAD);
  });

  it("should throw error for expired JWT", async () => {
    vi.setSystemTime(new Date(2024, 3, 22, 16, 20));
    await expect(auth.verifyJWT(JWT)).rejects.toThrow(
      "Token expired at 1713741600, current time is 1713802800",
    );
  });

  it("should throw error for invalid audience", async () => {
    await expect(
      auth.verifyJWT(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0cmVhc3VyZS5sb2wiLCJhdWQiOiJpbnZhbGlkLnRyZWFzdXJlLmxvbCIsImV4cCI6MTcxMzc0MTYwMCwiaWF0IjoxNzEzNjU1MjAwfQ.4o9mYJsLPMKmpOXibr1Wu-UuWAdI5zaxCektUW2GRIo",
      ),
    ).rejects.toThrow(
      'Expected audience "treasure.lol", but found "invalid.treasure.lol"',
    );
  });

  it("should throw error for invalid issuer", async () => {
    await expect(
      auth.verifyJWT(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpbnZhbGlkLnRyZWFzdXJlLmxvbCIsImF1ZCI6InRyZWFzdXJlLmxvbCIsImV4cCI6MTcxMzc0MTYwMCwiaWF0IjoxNzEzNjU1MjAwfQ.sxAWLAiXl8zSTKOyyWoRTQCX_imjglNl0Tt56cDVVvg",
      ),
    ).rejects.toThrow(
      'Expected issuer "treasure.lol", but found "invalid.treasure.lol"',
    );
  });
});
