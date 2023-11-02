import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  ConnectWallet,
  ThirdwebProvider,
  coinbaseWallet,
  metamaskWallet,
  rainbowWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { EmbeddedWallet } from "@thirdweb-dev/wallets";
import { Button } from "@treasure/tdk-react";
import { useState } from "react";
import VerificationInput from "react-verification-input";
import { env } from "~/utils/env";
import { tdk } from "~/utils/tdk";

const wallet = new EmbeddedWallet({
  chain: {
    chainId: 42161,
    rpc: ["https://arb1.arbitrum.io/rpc"],
  },
  clientId: env.VITE_THIRDWEB_CLIENT_ID,
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug = "platform" } = params;
  try {
    const project = await tdk.project.findBySlug(slug);
    return json({ project });
  } catch (err) {
    console.error("Error fetching project details:", err);
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Log in to ${data?.project.name}` }];
};

export default function Index() {
  const { project } = useLoaderData<typeof loader>();
  const [email, setEmail] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [error, setError] = useState("");

  const handleSignInComplete = (address: string) => {
    console.log(address);
  };

  const handleSignInWithEmail = () => {
    wallet.sendVerificationEmail({ email });
    setShowVerificationInput(true);
  };

  const handleSubmitVerificationCode = async (verificationCode: string) => {
    try {
      const { user } = await wallet.authenticate({
        strategy: "email_verification",
        email,
        verificationCode,
      });
      if (!user) {
        return setError(
          "Sorry, we were unable to log you in. Please contact support.",
        );
      }

      handleSignInComplete(user.walletAddress);
    } catch (err) {
      console.error("Error authenticating with verification code:", err);
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      const { user } = await wallet.authenticate({ strategy: "google" });
      if (!user) {
        return setError(
          "Sorry, we were unable to log you in. Please contact support.",
        );
      }

      handleSignInComplete(user.walletAddress);
    } catch (err) {
      console.error("Error authenticating with Google:", err);
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[url(/img/background.png)] bg-cover bg-center" />
      <div className="relative flex h-full items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white">
          <div className="h-64 bg-slate-800" />
          <div className="space-y-5 p-8">
            <div className="flex items-end justify-between">
              <div className="font-semibold">
                {project.slug === "platform" ? (
                  <h1 className="text-2xl">Log in to Treasure</h1>
                ) : (
                  <>
                    <h2 className="leading-4">Log in with Treasure to play</h2>
                    <h1 className="text-3xl">{project.name}</h1>
                  </>
                )}
              </div>
            </div>
            {error ? <div>{error}</div> : null}
            {showVerificationInput ? (
              <div className="space-y-2 px-8 text-center">
                <p className="text-sm">
                  Please check your email inbox and enter the 6-digit
                  verification code to continue:
                </p>
                <VerificationInput
                  length={6}
                  placeholder=""
                  autoFocus
                  onComplete={handleSubmitVerificationCode}
                  classNames={{
                    container: "mx-auto",
                    character: "rounded bg-white",
                    characterInactive: "bg-white",
                    characterSelected: "border-[#DC2626] outline-[#DC2626]",
                  }}
                />
                <span className="block text-center">or</span>
                <Button
                  variant="secondary"
                  className="text-slate-800 hover:text-slate-700"
                  onClick={() => setShowVerificationInput(false)}
                >
                  Go back
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label htmlFor="email" className="block font-semibold">
                      Email
                    </label>
                    <input
                      id="email"
                      className="w-full rounded-lg border border-[#dcdcdc] px-2.5 py-1.5 outline-[#DC2626]"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button disabled={!email} onClick={handleSignInWithEmail}>
                    Sign in
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center justify-center gap-2 text-slate-800 hover:text-slate-700"
                    onClick={handleSignInWithGoogle}
                  >
                    <img src="/img/google.svg" />
                    Continue with Google
                  </Button>
                </div>
                <span className="block text-center">or</span>
                <ThirdwebProvider
                  clientId={env.VITE_THIRDWEB_CLIENT_ID}
                  supportedWallets={[
                    metamaskWallet(),
                    coinbaseWallet(),
                    walletConnect(),
                    rainbowWallet(),
                  ]}
                >
                  <div className="text-center">
                    <ConnectWallet
                      btnTitle={"Connect Web3 Wallet"}
                      modalSize={"compact"}
                      welcomeScreen={{ title: "" }}
                      modalTitleIconUrl={""}
                    />
                  </div>
                </ThirdwebProvider>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
