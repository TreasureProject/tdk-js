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
import { useEffect, useMemo, useState } from "react";
import VerificationInput from "react-verification-input";
import { env } from "~/utils/env";
import { type SupportedChainId, getRpcsByChainId } from "~/utils/network";
import { tdk } from "~/utils/tdk";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { slug = "platform" } = params;
  const project = await (async () => {
    try {
      const result = await tdk.project.findBySlug(slug);
      return result;
    } catch (err) {
      console.error("Error fetching project details:", err);
      return undefined;
    }
  })();

  if (!project) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const url = new URL(request.url);
  const chainId = Number(url.searchParams.get("chain_id") || 0);
  const redirectUri =
    url.searchParams.get("redirect_uri") || "https://app.treasure.lol";

  if (!project.redirectUris.includes(redirectUri)) {
    throw new Response(null, {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return json({
    project,
    chainId: chainId || 42161,
    redirectUri,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Log in to ${data?.project.name}` }];
};

export default function Index() {
  const { project, chainId, redirectUri } = useLoaderData<typeof loader>();
  const [email, setEmail] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [error, setError] = useState("");

  const wallet = useMemo(
    () =>
      new EmbeddedWallet({
        chain: {
          chainId,
          rpc: getRpcsByChainId(chainId),
        },
        clientId: env.VITE_THIRDWEB_CLIENT_ID,
      }),
    [chainId],
  );

  const handleSignInComplete = async (address: string) => {
    try {
      const { address: tdkAddress } = await tdk.logIn({
        project: project.slug,
        chainId: chainId as SupportedChainId,
        address,
      });
      window.location.href = `${redirectUri}?tdk_address=${tdkAddress}`;
    } catch (err) {
      console.error("Error completing sign in:", err);
      setError("Sorry, we were unable to log you in. Please contact support.");
    }
  };

  useEffect(() => {
    handleSignInComplete("0x2cc546ceA1D15739520D982b1c7a2aB282831c91");
  }, []);

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
