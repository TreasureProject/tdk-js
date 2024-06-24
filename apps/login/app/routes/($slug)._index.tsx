import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

import { CHAIN_ID_TO_CHAIN_MAPPING } from "~/utils/chain";
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
      console.error("Error fetching project details:", err, { chainId, slug });
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
    console.error("Error loading login flow: invalid redirect URI", {
      project,
      redirectUri,
    });
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

export default function LoginPage() {
  const { project, chainId, redirectUri } = useLoaderData<typeof loader>();
  const chain =
    CHAIN_ID_TO_CHAIN_MAPPING[chainId] ??
    CHAIN_ID_TO_CHAIN_MAPPING[DEFAULT_TDK_CHAIN_ID];

  const [verificationInput, setVerificationInput] = useState<string>("");
  const {
    status,
    error,
    isLoading,
    startEmailLogin,
    finishEmailLogin,
    logInWithSocial,
    // logInWithCustomAuth,
    reset,
  } = useLogin({
    project,
    chain,
    redirectUri,
  });

  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    if (password) {
      // await logInWithCustomAuth(email, password);
    } else {
      await startEmailLogin(email);
    }
  });

  return (
    <div className="h-full overflow-hidden">
      <div className="fixed inset-0 bg-[url(/img/background.png)] bg-center bg-cover" />
      <div className="relative grid h-full place-items-center p-6">
        <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-honey-25 shadow-black/20 shadow-xl">
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="flex h-16 items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-2">
                <img
                  src={
                    project.icon ??
                    "https://images.treasure.lol/tdk/login/treasure_icon.png"
                  }
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg bg-honey-200 p-1"
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
                <p className="mt-4 rounded-lg border border-ruby-400 bg-ruby-300 px-3 py-2 text-ruby-900 text-sm">
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
                  <img className="mx-auto w-20" src={emailImg} alt="" />
                  <div className="space-y-1.5">
                    <p className="font-medium">We&apos;ve sent you an email</p>
                    <p className="mx-auto mt-2 max-w-sm text-night-500 text-sm">
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
                  <div>
                    <Button
                      className="flex w-full items-center justify-center"
                      size="lg"
                      onClick={() => finishEmailLogin(verificationInput)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <SpinnerIcon className="h-5 w-5" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => reset()}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {!project.customAuth ? (
                    <>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex w-full items-center justify-center border border-night-200 bg-honey-50"
                          onClick={() => logInWithSocial("google")}
                          disabled={isLoading}
                        >
                          <GoogleLogoIcon className="h-6 w-6 text-night-700" />
                          <span className="sr-only">Continue with Google</span>
                        </Button>
                      </div>
                      <div className="mt-4 flex items-center">
                        <hr className="flex-1 border-night-100 border-t" />
                        <p className="mx-2.5 text-center text-night-600">or</p>
                        <hr className="flex-1 border-night-100 border-t" />
                      </div>
                    </>
                  ) : null}
                  <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block font-semibold text-night-1200 text-sm"
                      >
                        Email
                      </label>
                      <input
                        {...register("email", { required: true })}
                        id="email"
                        type="email"
                        placeholder="Enter your email address..."
                        className="w-full rounded-lg border border-night-200 px-3 py-2.5 outline-ruby-900 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      />
                    </div>
                    {project.customAuth ? (
                      <>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="password"
                            className="block font-semibold text-night-1200 text-sm"
                          >
                            Password
                          </label>
                          <input
                            {...register("password", { required: true })}
                            id="password"
                            type="password"
                            placeholder="Your Password"
                            className="w-full rounded-lg border border-night-200 px-2.5 py-1.5 outline-ruby-900 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    ) : null}
                    <Button
                      type="submit"
                      className="flex w-full items-center justify-center"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <SpinnerIcon className="h-5 w-5" />
                      ) : (
                        "Connect"
                      )}
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
}
