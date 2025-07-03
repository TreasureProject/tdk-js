// Run me with `npx tsx client-mock.ts`

import { createThirdwebClient } from "thirdweb";
import { type LoginPayload, signLoginPayload } from "thirdweb/auth";
import { arbitrumSepolia } from "thirdweb/chains";
import {
  privateKeyAccount,
  randomPrivateKey,
  smartWallet,
} from "thirdweb/wallets";

const THIRDWEB_SECRET_KEY = ""; // ZEE: Replace with your Thirdweb secret key
const API_URL = "http://localhost:8080";
const CHAIN = arbitrumSepolia;

const client = createThirdwebClient({
  secretKey: THIRDWEB_SECRET_KEY,
});

// Mock connected wallet
const personalAccount = privateKeyAccount({
  client,
  privateKey: randomPrivateKey(),
});

// Configure the smart wallet
const wallet = smartWallet({
  chain: CHAIN,
  sponsorGas: true,
});

// Connect the smart wallet
const smartAccount = await wallet.connect({
  client,
  personalAccount,
});

// Fetch login payload
const loginPayloadResponse = await fetch(
  `${API_URL}/login/payload?address=${smartAccount.address}`,
  {
    headers: {
      "X-Chain-Id": CHAIN.id.toString(),
    },
  },
);

if (!loginPayloadResponse.ok) {
  throw new Error(
    `Failed to fetch login payload: ${loginPayloadResponse.statusText}`,
  );
}

const loginPayload: LoginPayload = await loginPayloadResponse.json();

// Sign login payload with smart wallet
const signedPayload = await signLoginPayload({
  payload: loginPayload,
  account: smartAccount,
});

// Log in
const loginResponse = await fetch(`${API_URL}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Chain-Id": CHAIN.id.toString(),
  },
  body: JSON.stringify(signedPayload),
});

if (!loginResponse.ok) {
  throw new Error(`Failed to log in: ${loginResponse.statusText}`);
}

const loginResult = await loginResponse.json();
console.log("Login successful:", loginResult);

// Validate user sessions, create new sessions, etc.
// ZEE: TODO

// Use the auth token in other API calls
const userResponse = await fetch(`${API_URL}/users/me`, {
  headers: {
    Authorization: `Bearer ${loginResult.token}`,
    "X-Chain-Id": CHAIN.id.toString(),
  },
});

if (!userResponse.ok) {
  throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
}

const user = await userResponse.json();
console.log("User:", user);
