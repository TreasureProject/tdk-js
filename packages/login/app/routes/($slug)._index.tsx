import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  ConnectWallet,
  ThirdwebProvider,
  coinbaseWallet,
  embeddedWallet,
  metamaskWallet,
  rainbowWallet,
  smartWallet,
  useConnectionStatus,
  useLogin,
  useSmartWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { TDKAPI } from "@treasure/tdk-api";
import { Button, getTreasureContractAddress } from "@treasure/tdk-react";
import { useEffect, useRef, useState } from "react";
import VerificationInput from "react-verification-input";
import { env } from "~/utils/env";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { slug = "platform" } = params;
  const project = await (async () => {
    try {
      const result = await new TDKAPI(env.VITE_TDK_API_URL).project.findBySlug(
        slug,
      );
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

const InnterLoginPage = () => {
  const { project, chainId, redirectUri } = useLoaderData<typeof loader>();
  const [email, setEmail] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const { connect: connectSmartWallet } = useSmartWallet(embeddedWallet(), {
    factoryAddress: getTreasureContractAddress(
      chainId,
      "TreasureLoginAccountFactory",
    ),
    gasless: true,
  });
  const { login: logInWallet } = useLogin();
  const connectionStatus = useConnectionStatus();
  const didAttemptLogin = useRef(false);
  const [error, setError] = useState("");

  const handleSignInWithEmail = async () => {
    await connectSmartWallet({
      connectPersonalWallet: async (embeddedWallet) => {
        await embeddedWallet.sendVerificationEmail({ email });
        setShowVerificationInput(true);
      },
    });
  };

  const handleSubmitVerificationCode = async (verificationCode: string) => {
    try {
      await connectSmartWallet({
        connectPersonalWallet: async (embeddedWallet) => {
          const authResult = await embeddedWallet.authenticate({
            strategy: "email_verification",
            email,
            verificationCode,
          });
          await embeddedWallet.connect({ authResult });
        },
      });
    } catch (err) {
      console.error("Error authenticating with verification code:", err);
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await connectSmartWallet({
        connectPersonalWallet: async (embeddedWallet) => {
          const authResult = await embeddedWallet.authenticate({
            strategy: "google",
          });
          await embeddedWallet.connect({ authResult });
        },
      });
    } catch (err) {
      console.error("Error authenticating with Google:", err);
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    // Track didAttemptLogin ref because loginWallet is not memoized
    if (connectionStatus === "connected" && !didAttemptLogin.current) {
      didAttemptLogin.current = true;
      (async () => {
        try {
          const token = await logInWallet();
          window.location.href = `${redirectUri}?tdk_auth_token=${token}`;
        } catch (err) {
          console.error("Error completing sign in:", err);
          setError(
            "Sorry, we were unable to log you in. Please contact support.",
          );
        }
      })();
    }
  }, [redirectUri, connectionStatus, logInWallet]);

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
                <div className="text-center">
                  <ConnectWallet
                    btnTitle={"Connect Web3 Wallet"}
                    modalSize={"compact"}
                    welcomeScreen={{ title: "" }}
                    modalTitleIconUrl=""
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default function LoginPage() {
  const { chainId } = useLoaderData<typeof loader>();
  const smartWalletOptions = {
    factoryAddress: getTreasureContractAddress(
      chainId,
      "TreasureLoginAccountFactory",
    ),
    gasless: true,
  };
  return (
    <ThirdwebProvider
      clientId={env.VITE_THIRDWEB_CLIENT_ID}
      activeChain={chainId}
      supportedWallets={[
        smartWallet(metamaskWallet(), smartWalletOptions),
        smartWallet(coinbaseWallet(), smartWalletOptions),
        smartWallet(walletConnect(), smartWalletOptions),
        smartWallet(rainbowWallet(), smartWalletOptions),
      ]}
      authConfig={{
        domain: env.VITE_THIRDWEB_AUTH_DOMAIN,
        authUrl: `${env.VITE_TDK_API_URL}/auth`,
      }}
    >
      <InnterLoginPage />
    </ThirdwebProvider>
  );
}
