import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Arbitrum, ArbitrumSepolia } from "@thirdweb-dev/chains";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import {
  Button,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  GoogleLogoIcon,
  TDKAPI,
} from "@treasure-dev/tdk-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import VerificationInput from "react-verification-input";
import { ClientOnly } from "remix-utils/client-only";
import emailImg from "~/assets/email.webp";
import logoImg from "~/assets/logo.svg";
import { SpinnerIcon } from "~/components/SpinnerIcon";
import { useLogin } from "~/hooks/useLogin";

import { env } from "../utils/env";

type LoginForm = {
  email: string;
  password: string;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const slug = params.slug ?? DEFAULT_TDK_APP;
  const url = new URL(request.url);
  const chainId = Number(
    url.searchParams.get("chain_id") || DEFAULT_TDK_CHAIN_ID,
  );

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

  const redirectUri = url.searchParams.get("redirect_uri");

  if (!redirectUri || !project.redirectUris.includes(redirectUri)) {
    throw new Response(null, {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return json({
    project,
    chainId,
    redirectUri,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const project = data?.project;
  if (!project) {
    return [];
  }

  if (project.slug === "app" || project.customAuth) {
    return [{ title: `Connect to ${data?.project.name}` }];
  }

  return [{ title: `Connect to ${project.name} | Treasure Connect` }];
};

const InnerLoginPage = () => {
  const { project, chainId, redirectUri } = useLoaderData<typeof loader>();
  const [verificationInput, setVerificationInput] = useState<string>("");
  const {
    status,
    error,
    isLoading,
    startEmailLogin,
    finishEmailLogin,
    logInWithSSO,
    logInWithCustomAuth,
  } = useLogin({
    project: project.slug,
    chainId,
    redirectUri,
    backendWallet: project.backendWallets[0],
    approvedCallTargets: project.callTargets,
  });

  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    if (password) {
      await logInWithCustomAuth(email, password);
    } else {
      await startEmailLogin(email);
    }
  });

  return (
    <div className="h-full overflow-hidden">
      <div className="fixed inset-0 bg-[url(/img/background.png)] bg-cover bg-center" />
      <div className="relative grid h-full place-items-center p-6">
        <div className="bg-honey-25 relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl shadow-xl shadow-black/20">
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="flex h-16 items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-2">
                <img
                  src={
                    project.icon ??
                    "https://images.treasure.lol/tdk/login/treasure_icon.png"
                  }
                  alt=""
                  className="bg-honey-200 h-14 w-14 shrink-0 rounded-lg p-1"
                />
                <div>
                  <h1 className="text-night-600 text-sm">Connect to</h1>
                  <h2 className="font-medium">{project.name}</h2>
                </div>
              </div>
              <img src={logoImg} alt="" className="h-8 w-auto" />
            </div>
            <div className="w-full px-5 pb-5">
              {error ? (
                <p className="bg-ruby-300 text-ruby-900 border-ruby-400 mt-4 rounded-lg border px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}
              {status === "START_SESSION" ? (
                <div className="flex h-32 flex-col items-center justify-center gap-3">
                  <SpinnerIcon className="h-8 w-8" />
                  <p className="text-night-1000">Starting session...</p>
                </div>
              ) : status === "CONFIRM_EMAIL" ? (
                <div className="my-4 space-y-4 text-center">
                  <img className="mx-auto w-20" src={emailImg} />
                  <div className="space-y-1.5">
                    <p className="font-medium">We&apos;ve sent you an email</p>
                    <p className="text-night-500 mx-auto mt-2 max-w-sm text-sm">
                      We&apos;ve sent a code to your email. Please enter it
                      below to confirm your login.
                    </p>
                  </div>
                  <ClientOnly>
                    {() => (
                      <VerificationInput
                        length={6}
                        placeholder=""
                        autoFocus
                        onChange={setVerificationInput}
                        onComplete={finishEmailLogin}
                        classNames={{
                          container: "mx-auto",
                          character:
                            "rounded text-lg flex items-center justify-center bg-white bg-white border border-night-200 text-night-1200",
                          characterInactive: "bg-white",
                          characterSelected:
                            "border-ruby-900 outline-ruby-900 text-night-1200",
                        }}
                      />
                    )}
                  </ClientOnly>
                  <Button
                    className="w-full"
                    onClick={() => finishEmailLogin(verificationInput)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              ) : (
                <>
                  {!project.customAuth ? (
                    <>
                      <div className="mt-4">
                        <Button
                          variant="secondary"
                          className="border-night-200 bg-honey-50 flex w-full items-center justify-center border"
                          onClick={() => logInWithSSO("google")}
                          disabled={isLoading}
                        >
                          <GoogleLogoIcon className="text-night-700 h-6 w-6" />
                          <span className="sr-only">Continue with Google</span>
                        </Button>
                      </div>
                      <div className="mt-4 flex items-center">
                        <hr className="border-night-100 flex-1 border-t" />
                        <p className="text-night-600 mx-2.5 text-center">or</p>
                        <hr className="border-night-100 flex-1 border-t" />
                      </div>
                    </>
                  ) : null}
                  <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="text-night-1200 block text-sm font-semibold"
                      >
                        Email
                      </label>
                      <input
                        {...register("email", { required: true })}
                        id="email"
                        type="email"
                        placeholder="Enter your email address..."
                        className="outline-ruby-900 border-night-200 w-full rounded-lg border px-3 py-2.5 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      />
                    </div>
                    {project.customAuth ? (
                      <>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="password"
                            className="text-night-1200 block text-sm font-semibold"
                          >
                            Password
                          </label>
                          <input
                            {...register("password", { required: true })}
                            id="password"
                            type="password"
                            placeholder="Your Password"
                            className="outline-ruby-900 border-night-200 w-full rounded-lg border px-2.5 py-1.5 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    ) : null}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      Connect
                    </Button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const { chainId } = useLoaderData<typeof loader>();
  return (
    <ThirdwebProvider
      clientId={env.VITE_THIRDWEB_CLIENT_ID}
      activeChain={chainId}
      supportedChains={
        chainId === ArbitrumSepolia.chainId ? [ArbitrumSepolia] : [Arbitrum]
      }
      authConfig={{
        domain: env.VITE_THIRDWEB_AUTH_DOMAIN,
        authUrl: `${env.VITE_TDK_API_URL}/auth`,
      }}
    >
      <InnerLoginPage />
    </ThirdwebProvider>
  );
}
