import {
  createTreasureConnectClient,
  logInWithEmail,
  logInWithSocial,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";

import "./style.css";

const client = createTreasureConnectClient(import.meta.env.VITE_TDK_CLIENT_ID);
const chainId = 421614;
const apiUri = import.meta.env.VITE_TDK_API_URL;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main>
    <h1>TDK Core - Treasure Connect Example</h1>
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
      <button id="log-out">Log Out</button>
    </div>
  </main>
`;

(() => {
  const connectContainer =
    document.querySelector<HTMLDivElement>("#connect-container")!;
  const userContainer =
    document.querySelector<HTMLDivElement>("#user-container")!;
  const userEmail =
    userContainer.querySelector<HTMLSpanElement>("#user-email")!;
  const connectWithGoogleButton =
    document.querySelector<HTMLButtonElement>("#connect-google")!;
  const emailContainer =
    document.querySelector<HTMLDivElement>("#email-container")!;
  const codeContainer =
    document.querySelector<HTMLDivElement>("#code-container")!;
  const emailInput = emailContainer.querySelector<HTMLInputElement>("input")!;
  const emailButton =
    emailContainer.querySelector<HTMLButtonElement>("button")!;
  const codeInput = codeContainer.querySelector<HTMLInputElement>("input")!;
  const codeButton = codeContainer.querySelector<HTMLButtonElement>("button")!;
  const logOutButton =
    userContainer.querySelector<HTMLButtonElement>("#log-out")!;

  // Set up initial layout
  connectContainer.hidden = false;
  userContainer.hidden = true;
  emailContainer.hidden = false;
  codeContainer.hidden = true;

  // Set up Connect with Google flow
  connectWithGoogleButton.addEventListener("click", async () => {
    connectWithGoogleButton.disabled = true;
    try {
      const result = await logInWithSocial({
        client,
        network: "google",
        apiUri,
        chainId,
      });
      userEmail.innerHTML = result.user.email || result.user.id;
      connectContainer.hidden = true;
      userContainer.hidden = false;
    } catch (err) {
      console.error("Error logging in with Google:", err);
    }

    connectWithGoogleButton.disabled = false;
  });

  // Set up Connect with Email flow
  emailButton.addEventListener("click", async () => {
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

  codeButton.addEventListener("click", async () => {
    codeButton.disabled = true;
    try {
      const result = await logInWithEmail({
        client,
        email: emailInput.value,
        verificationCode: codeInput.value,
        apiUri,
        chainId,
      });
      userEmail.innerHTML = result.user.email || result.user.id;
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

  // Set up Log Out button
  logOutButton.addEventListener("click", () => {
    connectContainer.hidden = false;
    userContainer.hidden = true;
    emailInput.value = "";
    codeInput.value = "";
  });
})();
