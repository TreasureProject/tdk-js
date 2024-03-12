import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Arbitrum, ArbitrumSepolia } from "@thirdweb-dev/chains";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { TDKAPI } from "@treasure/tdk-core";
import { Button, type ProjectSlug } from "@treasure/tdk-react";
import { useForm } from "react-hook-form";
import VerificationInput from "react-verification-input";
import { ClientOnly } from "remix-utils/client-only";
import { SpinnerIcon } from "~/components/SpinnerIcon";
import { useTreasureLogin } from "~/hooks/useTreasureLogin";

import { env } from "../utils/env";

type LoginForm = {
  email: string;
  password: string;
};

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
  const project = data?.project;
  if (!project) {
    return [];
  }

  if (project.slug === "app" || project.customAuth) {
    return [{ title: `Log in to ${data?.project.name}` }];
  }

  return [{ title: `${project.name} | Log in with Treasure` }];
};

const InnerLoginPage = () => {
  const { project, chainId, redirectUri } = useLoaderData<typeof loader>();
  const {
    status,
    error,
    reset,
    startEmailLogin,
    finishEmailLogin,
    logInWithSSO,
    logInWithCustomAuth,
  } = useTreasureLogin({
    projectId: project.slug as ProjectSlug,
    chainId,
    redirectUri,
    backendWallet: project.backendWallets[0],
    approvedCallTargets: project.callTargets,
  });

  const {
    register,
    handleSubmit,
    // formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    if (password) {
      await logInWithCustomAuth(email, password);
    } else {
      await startEmailLogin(email);
    }
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
          <form className="space-y-5 p-8" onSubmit={onSubmit}>
            <div className="font-semibold">
              {project.slug === "app" || project.customAuth ? (
                <h1 className="text-2xl">Log in to {project.name}</h1>
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
                      {...register("email", { required: true })}
                      id="email"
                      type="email"
                      className="w-full rounded-lg border border-[#dcdcdc] px-2.5 py-1.5 outline-[#DC2626] disabled:cursor-not-allowed"
                      disabled={isInputDisabled}
                    />
                  </div>
                  {project.customAuth ? (
                    <>
                      <div className="space-y-1">
                        <label
                          htmlFor="password"
                          className="block font-semibold"
                        >
                          Password
                        </label>
                        <input
                          {...register("password", { required: true })}
                          id="password"
                          type="password"
                          className="w-full rounded-lg border border-[#dcdcdc] px-2.5 py-1.5 outline-[#DC2626] disabled:cursor-not-allowed"
                          disabled={isInputDisabled}
                        />
                      </div>
                    </>
                  ) : null}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isInputDisabled}
                  >
                    Sign in
                  </Button>
                  {!project.customAuth ? (
                    <Button
                      variant="secondary"
                      className="flex w-full items-center justify-center gap-2 text-slate-800 hover:text-slate-700"
                      onClick={() => logInWithSSO("google")}
                      disabled={isInputDisabled}
                    >
                      <img src="/img/google.svg" />
                      Continue with Google
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
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
