import {
  type AddressString,
  type SessionOptions,
  type TDKAPI,
  type User,
  createTreasureConnectClient,
  getContractAddress,
  logInWithEmail,
  logInWithSocial,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";

import "./style.css";

const client = createTreasureConnectClient({
  clientId: import.meta.env.VITE_TDK_CLIENT_ID,
});
const chainId = 421614;
const apiUri = import.meta.env.VITE_TDK_API_URL;
const sessionOptions: SessionOptions = {
  backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
  approvedTargets: ["0x55d0cf68a1afe0932aff6f36c87efa703508191c"],
};

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main>
    <h1>Treasure Connect - TypeScript Example</h1>
    <div id="connect-container">
      <button
        id="connect-google"
        type="button"
      >
        Connect with Google
      </button>
      <p>
        or
      </p>
      <div>
        <h2>Connect with Email</h2>
        <div id="email-container">
          <input
            type="email"
            placeholder="email@treasure.lol"
          />
          <button type="button">
            Send Code
          </button>
        </div>
        <div id="code-container">
          <input
            type="number"
            placeholder="Enter code..."
          />
          <button type="button">
            Confirm Code
          </button>
        </div>
      </div>
    </div>
    <div id="user-container">
      <h2>Logged in as <span id="user-email" /></h2>
      <button id="mint">Mint 1,000 MAGIC</button>
      <button id="log-out">Log Out</button>
    </div>
  </main>
`;

(() => {
  let tdk: TDKAPI;
  let user: User;

  const connectContainer =
    document.querySelector<HTMLDivElement>("#connect-container")!;
  const userContainer =
    document.querySelector<HTMLDivElement>("#user-container")!;
  const userEmail =
    userContainer.querySelector<HTMLSpanElement>("#user-email")!;
  const connectWithGoogleButton =
    document.querySelector<HTMLButtonElement>("#connect-google");
  const emailContainer =
    document.querySelector<HTMLDivElement>("#email-container")!;
  const codeContainer =
    document.querySelector<HTMLDivElement>("#code-container")!;
  const emailInput = emailContainer.querySelector<HTMLInputElement>("input")!;
  const emailButton = emailContainer.querySelector<HTMLButtonElement>("button");
  const codeInput = codeContainer.querySelector<HTMLInputElement>("input")!;
  const codeButton = codeContainer.querySelector<HTMLButtonElement>("button");
  const mintButton = userContainer.querySelector<HTMLButtonElement>("#mint");
  const logOutButton =
    userContainer.querySelector<HTMLButtonElement>("#log-out");

  // Set up initial layout
  connectContainer.hidden = false;
  userContainer.hidden = true;
  emailContainer.hidden = false;
  codeContainer.hidden = true;

  // Set up Connect with Google flow
  connectWithGoogleButton?.addEventListener("click", async () => {
    connectWithGoogleButton.disabled = true;
    try {
      const result = await logInWithSocial({
        client,
        network: "google",
        apiUri,
        chainId,
        sessionOptions,
      });
      tdk = result.tdk;
      user = result.user;
      userEmail.innerHTML = user.email || user.id;
      connectContainer.hidden = true;
      userContainer.hidden = false;
    } catch (err) {
      console.error("Error logging in with Google:", err);
    }

    connectWithGoogleButton.disabled = false;
  });

  // Set up Connect with Email flow
  emailButton?.addEventListener("click", async () => {
    emailButton.disabled = true;
    try {
      await sendEmailVerificationCode({
        client,
        email: emailInput.value,
      });
      emailContainer.hidden = true;
      codeContainer.hidden = false;
    } catch (err) {
      console.error("Error sending email verification code:", err);
    }

    emailButton.disabled = false;
  });

  codeButton?.addEventListener("click", async () => {
    codeButton.disabled = true;
    try {
      const result = await logInWithEmail({
        client,
        email: emailInput.value,
        verificationCode: codeInput.value,
        apiUri,
        chainId,
        sessionOptions,
      });
      tdk = result.tdk;
      user = result.user;
      userEmail.innerHTML = user.email || user.id;
      connectContainer.hidden = true;
      userContainer.hidden = false;
    } catch (err) {
      codeInput.value = "";
      emailContainer.hidden = false;
      codeContainer.hidden = true;
      console.error("Error logging in with email:", err);
    }

    codeButton.disabled = false;
  });

  // Set up Mint button
  mintButton?.addEventListener("click", async () => {
    mintButton.disabled = true;
    try {
      const result = await tdk.transaction.create(
        {
          address: getContractAddress(chainId, "MAGIC"),
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "mint",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ] as const,
          functionName: "mint",
          args: [
            user.address as AddressString,
            1000000000000000000000n, // 1,000
          ],
        },
        { includeAbi: true },
      );
      console.log("Mint transaction:", result);
    } catch (err) {
      console.error("Error minting MAGIC:", err);
    }

    mintButton.disabled = false;
  });

  // Set up Log Out button
  logOutButton?.addEventListener("click", () => {
    connectContainer.hidden = false;
    userContainer.hidden = true;
    emailInput.value = "";
    codeInput.value = "";
  });
})();
