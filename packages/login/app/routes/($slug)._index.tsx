import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Arbitrum, ArbitrumSepolia } from "@thirdweb-dev/chains";
import {
  ConnectWallet,
  type SmartWalletConfigOptions,
  ThirdwebProvider,
  coinbaseWallet,
  metamaskWallet,
  rainbowWallet,
  smartWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { TDKAPI } from "@treasure/tdk-api";
import {
  Button,
  type ProjectSlug,
  getContractAddress,
} from "@treasure/tdk-react";
import { useRef } from "react";
import VerificationInput from "react-verification-input";
import { ClientOnly } from "remix-utils/client-only";
import { SpinnerIcon } from "~/components/SpinnerIcon";
import { useTreasureLogin } from "~/hooks/useTreasureLogin";

import { env } from "../utils/env";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const slug = (params.slug as ProjectSlug) ?? "app";
  const url = new URL(request.url);
  const chainId = Number(url.searchParams.get("chain_id") || 0);

  const project = await (async () => {
    try {
      const result = await new TDKAPI({
        baseUri: env.VITE_TDK_API_URL,
        chainId,
      }).project.findBySlug(slug);
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

  const redirectUri =
    url.searchParams.get("redirect_uri") || "http://localhost:5174";

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

const InnerLoginPage = () => {
  const { project, chainId, redirectUri } = useLoaderData<typeof loader>();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const {
    status,
    error,
    reset,
    startEmailLogin,
    finishEmailLogin,
    logInWithSSO,
    handleLogin,
  } = useTreasureLogin({
    chainId,
    redirectUri,
    backendWallet: project.backendWallets[0],
    approvedCallTargets: project.callTargets,
  });

  const isInputDisabled = status === "SENDING_EMAIL";

  return (
    <>
      <div className="fixed inset-0 bg-[url(/img/background.png)] bg-cover bg-center" />
      <div className="relative flex h-full items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white">
          <div
            className="h-64 bg-slate-800 bg-cover bg-center"
            style={{
              backgroundImage: `url('${
                project.cover || "/img/default_cover.png"
              }')`,
            }}
          />
          <div className="space-y-5 p-8">
            <div className="font-semibold">
              {project.slug === "app" ? (
                <h1 className="text-2xl">Log in to Treasure</h1>
              ) : (
                <>
                  <h2 className="leading-4">Log in with Treasure to play</h2>
                  <h1 className="text-3xl">{project.name}</h1>
                </>
              )}
            </div>
            {error ? <div>{error}</div> : null}
            {status === "LOADING" ? (
              <div className="flex h-32 items-center justify-center">
                <SpinnerIcon className="h-8 w-8" />
              </div>
            ) : status === "CONFIRM_EMAIL" ? (
              <div className="space-y-2 px-8 text-center">
                <p className="text-sm">
                  Please check your email inbox and enter the 6-digit
                  verification code to continue:
                </p>
                <ClientOnly>
                  {() => (
                    <VerificationInput
                      length={6}
                      placeholder=""
                      autoFocus
                      onComplete={finishEmailLogin}
                      classNames={{
                        container: "mx-auto",
                        character: "rounded bg-white",
                        characterInactive: "bg-white",
                        characterSelected: "border-[#DC2626] outline-[#DC2626]",
                      }}
                    />
                  )}
                </ClientOnly>
                <span className="block text-center">or</span>
                <Button
                  variant="secondary"
                  className="text-slate-800 hover:text-slate-700"
                  onClick={reset}
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
                      ref={emailRef}
                      id="email"
                      className="w-full rounded-lg border border-[#dcdcdc] px-2.5 py-1.5 outline-[#DC2626] disabled:cursor-not-allowed"
                      type="email"
                      disabled={isInputDisabled}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() =>
                      emailRef.current?.value
                        ? startEmailLogin(emailRef.current.value)
                        : undefined
                    }
                    disabled={isInputDisabled}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-2 text-slate-800 hover:text-slate-700"
                    onClick={() => logInWithSSO("google")}
                    disabled={isInputDisabled}
                  >
                    <img src="/img/google.svg" />
                    Continue with Google
                  </Button>
                </div>
                <span className="block text-center">or</span>
                <div className="text-center">
                  <ConnectWallet
                    btnTitle="Connect Web3 Wallet"
                    modalSize="compact"
                    welcomeScreen={{ title: "" }}
                    modalTitleIconUrl=""
                    auth={{
                      loginOptional: false,
                      onLogin: handleLogin,
                    }}
                    switchToActiveChain
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
  const smartWalletOptions: SmartWalletConfigOptions = {
    factoryAddress: getContractAddress(chainId, "TreasureLoginAccountFactory"),
    gasless: true,
  };
  return (
    <ThirdwebProvider
      clientId={env.VITE_THIRDWEB_CLIENT_ID}
      activeChain={chainId}
      supportedChains={
        chainId === ArbitrumSepolia.chainId ? [ArbitrumSepolia] : [Arbitrum]
      }
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
      <InnerLoginPage />
    </ThirdwebProvider>
  );
}
