import {
  createTreasureConnectClient,
  logInWithEmail,
  logInWithSocial,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";
import { useState } from "react";

const client = createTreasureConnectClient(import.meta.env.VITE_TDK_CLIENT_ID);
const chainId = 421614;
const apiUri = import.meta.env.VITE_TDK_API_URL;

export const App = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const handleLogInWithGoogle = async () => {
    setIsLoading(true);

    try {
      const result = await logInWithSocial({
        client,
        network: "google",
        apiUri,
        chainId,
      });
      console.log("Successfully logged in:", result);
    } catch (err) {
      console.error("Error logging in with Google:", err);
    }

    setIsLoading(false);
  };

  const handleSendVerificationCode = async () => {
    setIsLoading(true);

    try {
      await sendEmailVerificationCode({ client, email });
      setIsVerifyingEmail(true);
    } catch (err) {
      console.error("Error sending verification code:", err);
    }

    setIsLoading(false);
  };

  const handleLogInWithEmail = async () => {
    setIsLoading(true);

    try {
      const result = await logInWithEmail({
        client,
        email,
        verificationCode,
        apiUri,
        chainId,
      });
      console.log("Successfully logged in:", result);
    } catch (err) {
      console.error("Error logging in with email:", err);
    }

    setIsLoading(false);
    setIsVerifyingEmail(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl text-ruby-900">
          TDK Core - Connect Example
        </h1>
      </header>
      <main className="space-y-6">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleLogInWithGoogle}
          className="rounded-lg bg-ruby-900 px-3 py-1.5 font-medium text-white"
        >
          Connect with Google
        </button>
        <div>or</div>
        <div>
          <h2 className="font-semibold text-lg text-ruby-900">
            Connect with Email
          </h2>
          {isVerifyingEmail ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="rounded-lg border border-night-300 px-2 py-1"
                placeholder="Enter code..."
                onChange={(e) => setVerificationCode(e.target.value)}
                value={verificationCode}
                disabled={isLoading}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={handleLogInWithEmail}
                className="rounded-lg bg-ruby-900 px-3 py-1.5 font-medium text-white"
              >
                Confirm Code
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsVerifyingEmail(false)}
                className="rounded-lg bg-ruby-900 px-3 py-1.5 font-medium text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="email"
                className="rounded-lg border border-night-300 px-2 py-1"
                placeholder="email@treasure.lol"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                disabled={isLoading}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSendVerificationCode}
                className="rounded-lg bg-ruby-900 px-3 py-1.5 font-medium text-white"
              >
                Send Code
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
