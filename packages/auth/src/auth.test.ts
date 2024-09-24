import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAuth } from "./auth";

vi.mock("@aws-sdk/client-kms", () => ({
  KMS: vi.fn().mockReturnValue({}),
}));

vi.mock("./kms", () => ({
  kmsSign: vi
    .fn()
    .mockReturnValue(
      "PfmCwq9Wa7kz0gliwzEYRbfivwViju9JKrsgDpaBM3qQ3GRlK_ulKjUdSQWfnoOrn5e6adI1PFZtwStYUwED_jJiv51U4K4nf-9pzIRpaFgYJ9590JSnGB5CbtDFBcJJlB7cf07H3aAwDeXVL9Ner1q-Yhy1nKWaaMEAdFoWS10Ck7uXTHO_sLnStaPafaSxtuM_aWYz1n4oLVXJGZXxdLeWTBcsgJTjmF9w2c8No-rN6z55QVOWAwZYdSykMZk1ILoM0cv5doSmub-QC3daT8agbiwgatG8i0EJzsxqBHPL4t6LFXahJIf6tNBs-STPSF6dpEV8IsDG_Ilsx5P_Kw",
    ),
  kmsGetPublicKey: vi.fn().mockReturnValue(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6S7asUuzq5Q/3U9rbs+P
kDVIdjgmtgWreG5qWPsC9xXZKiMV1AiV9LXyqQsAYpCqEDM3XbfmZqGb48yLhb/X
qZaKgSYaC/h2DjM7lgrIQAp9902Rr8fUmLN2ivr5tnLxUUOnMOc2SQtr9dgzTONY
W5Zu3PwyvAWk5D6ueIUhLtYzpcB+etoNdL3Ir2746KIy/VUsDwAM7dhrqSK8U2xF
CGlau4ikOTtvzDownAMHMrfE7q1B6WZQDAQlBmxRQsyKln5DIsKv6xauNsHRgBAK
ctUxZG8M4QJIx3S6Aughd3RZC4Ca5Ae9fd8L8mlNYBCrQhOZ7dS0f4at4arlLcaj
twIDAQAB
-----END PUBLIC KEY-----`),
}));

// Mock private key for creating new tests
// https://token.dev/
// -----BEGIN PRIVATE KEY-----
// MIIEwAIBADANBgkqhkiG9w0BAQEFAASCBKowggSmAgEAAoIBAQDpLtqxS7OrlD/d
// T2tuz4+QNUh2OCa2Bat4bmpY+wL3FdkqIxXUCJX0tfKpCwBikKoQMzddt+ZmoZvj
// zIuFv9eploqBJhoL+HYOMzuWCshACn33TZGvx9SYs3aK+vm2cvFRQ6cw5zZJC2v1
// 2DNM41hblm7c/DK8BaTkPq54hSEu1jOlwH562g10vcivbvjoojL9VSwPAAzt2Gup
// IrxTbEUIaVq7iKQ5O2/MOjCcAwcyt8TurUHpZlAMBCUGbFFCzIqWfkMiwq/rFq42
// wdGAEApy1TFkbwzhAkjHdLoC6CF3dFkLgJrkB7193wvyaU1gEKtCE5nt1LR/hq3h
// quUtxqO3AgMBAAECggEBANX6C+7EA/TADrbcCT7fMuNnMb5iGovPuiDCWc6bUIZC
// Q0yac45l7o1nZWzfzpOkIprJFNZoSgIF7NJmQeYTPCjAHwsSVraDYnn3Y4d1D3tM
// 5XjJcpX2bs1NactxMTLOWUl0JnkGwtbWp1Qq+DBnMw6ghc09lKTbHQvhxSKNL/0U
// C+YmCYT5ODmxzLBwkzN5RhxQZNqol/4LYVdji9bS7N/UITw5E6LGDOo/hZHWqJsE
// fgrJTPsuCyrYlwrNkgmV2KpRrGz5MpcRM7XHgnqVym+HyD/r9E7MEFdTLEaiiHcm
// Ish1usJDEJMFIWkF+rnEoJkQHbqiKlQBcoqSbCmoMWECgYEA/4379mMPF0JJ/EER
// 4VH7/ZYxjdyphenx2VYCWY/uzT0KbCWQF8KXckuoFrHAIP3EuFn6JNoIbja0NbhI
// HGrU29BZkATG8h/xjFy/zPBauxTQmM+yS2T37XtMoXNZNS/ubz2lJXMOapQQiXVR
// l/tzzpyWaCe9j0NT7DAU0ZFmDbECgYEA6ZbjkcOs2jwHsOwwfamFm4VpUFxYtED7
// 9vKzq5d7+Ii1kPKHj5fDnYkZd+mNwNZ02O6OGxh40EDML+i6nOABPg/FmXeVCya9
// Vump2Yqr2fAK3xm6QY5KxAjWWq2kVqmdRmICSL2Z9rBzpXmD5o06y9viOwd2bhBo
// 0wB02416GecCgYEA+S/ZoEa3UFazDeXlKXBn5r2tVEb2hj24NdRINkzC7h23K/z0
// pDZ6tlhPbtGkJodMavZRk92GmvF8h2VJ62vAYxamPmhqFW5Qei12WL+FuSZywI7F
// q/6oQkkYT9XKBrLWLGJPxlSKmiIGfgKHrUrjgXPutWEK1ccw7f10T2UXvgECgYEA
// nXqLa58G7o4gBUgGnQFnwOSdjn7jkoppFCClvp4/BtxrxA+uEsGXMKLYV75OQd6T
// IhkaFuxVrtiwj/APt2lRjRym9ALpqX3xkiGvz6ismR46xhQbPM0IXMc0dCeyrnZl
// QKkcrxucK/Lj1IBqy0kVhZB1IaSzVBqeAPrCza3AzqsCgYEAvSiEjDvGLIlqoSvK
// MHEVe8PBGOZYLcAdq4YiOIBgddoYyRsq5bzHtTQFgYQVK99Cnxo+PQAvzGb+dpjN
// /LIEAS2LuuWHGtOrZlwef8ZpCQgrtmp/phXfVi6llcZx4mMm7zYmGhh2AsA9yEQc
// acgc4kgDThAjD7VlXad9UHpNMO8=
// -----END PRIVATE KEY-----

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

const HEADER = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9";
const SIGNATURE =
  "PfmCwq9Wa7kz0gliwzEYRbfivwViju9JKrsgDpaBM3qQ3GRlK_ulKjUdSQWfnoOrn5e6adI1PFZtwStYUwED_jJiv51U4K4nf-9pzIRpaFgYJ9590JSnGB5CbtDFBcJJlB7cf07H3aAwDeXVL9Ner1q-Yhy1nKWaaMEAdFoWS10Ck7uXTHO_sLnStaPafaSxtuM_aWYz1n4oLVXJGZXxdLeWTBcsgJTjmF9w2c8No-rN6z55QVOWAwZYdSykMZk1ILoM0cv5doSmub-QC3daT8agbiwgatG8i0EJzsxqBHPL4t6LFXahJIf6tNBs-STPSF6dpEV8IsDG_Ilsx5P_Kw";
const JWT = `${HEADER}.eyJpc3MiOiJ0cmVhc3VyZS5sb2wiLCJzdWIiOiJlbmdpbmVlcjEiLCJhdWQiOiJ0cmVhc3VyZS5sb2wiLCJleHAiOjE3MTM3NDE2MDAsImlhdCI6MTcxMzY1NTIwMCwiY3R4Ijp7ImVtYWlsIjoiZW5naW5lZXJpbmdAdHJlYXN1cmUubG9sIn19.${SIGNATURE}`;
const JWT_INVALID_ISSUER = `${HEADER}.eyJpc3MiOiJpbnZhbGlkLnRyZWFzdXJlLmxvbCIsImF1ZCI6InRyZWFzdXJlLmxvbCIsImV4cCI6MTcxMzc0MTYwMCwiaWF0IjoxNzEzNjU1MjAwfQ.weaV3T53fREC0DCm-3H-ZVVX61yXoz1SwwOj7IJI4SNfrldlLy7gSXf93Yuo3g_8Adyt2I0X-jtgrh8a_KPRPyCpiANfd7Qq-5NavhiczcMeM7A80qKLlfWD7li8-hz8ytBW-9nnjPDXPmxDfPzNCeYbZBh6905vOWfQy4WlUrY1TPpQSbadew0T7JEX2fSullWWDEpmDGM83-bsEr6nj062T14xUCAKfDa6jbNrhTfzCLSf4lX_kC5PylZUquV5a8ozVexnhBCI-KLb1a59TsVvnBLUJWhVtWxHcRJJFfglUnK88dDlLlwyO9m1XutWvLA504HFTL38vT625-s5mQ`;
const JWT_INVALID_AUDIENCE = `${HEADER}.eyJpc3MiOiJ0cmVhc3VyZS5sb2wiLCJhdWQiOiJpbnZhbGlkLnRyZWFzdXJlLmxvbCIsImV4cCI6MTcxMzc0MTYwMCwiaWF0IjoxNzEzNjU1MjAwfQ.j1PPO0u_TbTfOvBVaLYG7DcFLXkWhzAxq7oX1PJqlfr4zfaIIy0qBu1XPxL4h_zNIOrRCd8bc9FobaAA5NR6QcRdEpsKRx1fhOF0HQFPw-IBeEOmmMC2xuEHP9XoS_u6b51puTc3S3wVH67RtKSs-J1EQI7ci4OoxajM1aQC6HHQMRDs4X6ap972FC1tPyWMVZr2uxC1GlPs6aN7qzIlCa-Hz-QzN5jK_tFQ450Nhy32PQzIMrcq3AZPtKO9F1G0stbv1yhOg0qAenwZrwK3XjjLeppgJ8kCGzd3lJsT2Vp3yhIyrn2bQdCf6iaFbQBptSxPG9pcaREXzUDB00hf4g`;

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
    await expect(auth.verifyJWT(JWT_INVALID_AUDIENCE)).rejects.toThrow(
      'Expected audience "treasure.lol", but found "invalid.treasure.lol"',
    );
  });

  it("should throw error for invalid issuer", async () => {
    await expect(auth.verifyJWT(JWT_INVALID_ISSUER)).rejects.toThrow(
      'Expected issuer "treasure.lol", but found "invalid.treasure.lol"',
    );
  });

  it("should skip audience validation", async () => {
    const auth = createAuth({
      kmsKey: "arn:kms-auth-test",
      issuer: "treasure.lol",
    });
    await expect(auth.verifyJWT(JWT_INVALID_AUDIENCE)).resolves.toBeDefined();
  });

  it("should skip issuer validation", async () => {
    const auth = createAuth({
      kmsKey: "arn:kms-auth-test",
      audience: "treasure.lol",
    });
    await expect(auth.verifyJWT(JWT_INVALID_ISSUER)).resolves.toBeDefined();
  });
});
