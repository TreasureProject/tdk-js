import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Arbitrum, ArbitrumSepolia } from "@thirdweb-dev/chains";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import {
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  TDKAPI,
} from "@treasure-dev/tdk-core";
import { Button, type ProjectSlug } from "@treasure-dev/tdk-react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import useMeasure from "react-use-measure";
import VerificationInput from "react-verification-input";
import { ClientOnly } from "remix-utils/client-only";
import logoImg from "~/assets/logo.svg";
import { SpinnerIcon } from "~/components/SpinnerIcon";
import { useTreasureLogin } from "~/hooks/useTreasureLogin";

import { env } from "../utils/env";

type LoginForm = {
  email: string;
  password: string;
};

const DURATION = 0.25;

const AppleLogo = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.0331 2C16.0759 2 16.1187 2 16.1639 2C16.2689 3.29665 15.7739 4.26551 15.1724 4.96712C14.5822 5.66389 13.7741 6.33967 12.4669 6.23713C12.3797 4.95905 12.8754 4.06205 13.4761 3.36205C14.0332 2.70969 15.0546 2.12918 16.0331 2Z"
      fill="currentColor"
    />
    <path
      d="M19.9899 15.4962C19.9899 15.5091 19.9899 15.5204 19.9899 15.5325C19.6226 16.6451 19.0986 17.5986 18.4592 18.4835C17.8754 19.2868 17.1601 20.3679 15.8828 20.3679C14.7791 20.3679 14.046 19.6582 12.9149 19.6388C11.7183 19.6195 11.0603 20.2323 9.96632 20.3865C9.84117 20.3865 9.71603 20.3865 9.59331 20.3865C8.78997 20.2702 8.14164 19.634 7.66932 19.0607C6.27659 17.3669 5.20035 15.1789 5.00012 12.3789C5.00012 12.1044 5.00012 11.8307 5.00012 11.5561C5.0849 9.55222 6.0586 7.92293 7.35283 7.13331C8.03587 6.71347 8.97486 6.35581 10.0204 6.51567C10.4685 6.5851 10.9263 6.7385 11.3276 6.89029C11.7078 7.03643 12.1834 7.2956 12.6339 7.28187C12.9391 7.27299 13.2427 7.11394 13.5503 7.00171C14.4513 6.67634 15.3346 6.30333 16.4988 6.47853C17.898 6.69006 18.8911 7.31174 19.5047 8.27091C18.3211 9.0242 17.3853 10.1594 17.5452 12.0979C17.6873 13.8588 18.7111 14.889 19.9899 15.4962Z"
      fill="currentColor"
    />
  </svg>
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const slug = (params.slug as ProjectSlug) ?? DEFAULT_TDK_APP;
  const url = new URL(request.url);
  const chainId = Number(
    url.searchParams.get("chain_id") || DEFAULT_TDK_CHAIN_ID,
  );

  const project = await (async () => {
    try {
      const result = {
        name: "ZeeVerse",
        slug: "t",
        backendWallets: ["0x123"],
        callTargets: ["0x123"],
        redirectUris: ["http://localhost:3000"],
        customAuth: false,
        icon: "https://cdn.zee-verse.com/images/simple-logo.svg?width=1080&quality=75&web=1",
        cover: null,
        color: null,
      };
      // const result = await new TDKAPI({
      //   baseUri: env.VITE_TDK_API_URL,
      //   chainId,
      // }).project.findBySlug(slug);
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
    changeStatus,
  } = useTreasureLogin({
    project: project.slug as ProjectSlug,
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
    <MotionConfig
      transition={{
        duration: DURATION,
      }}
    >
      <div className="h-full overflow-hidden">
        <div className="fixed inset-0 bg-[url(/img/background.png)] bg-cover bg-center" />
        <div
          style={
            {
              "--icon": `url("${project.icon}")`,
            } as React.CSSProperties
          }
          className="absolute inset-0 bg-repeat [background-image:var(--icon)] [background-size:1px_1px]"
        />
        <select
          className="relative"
          onChange={(e) => changeStatus(e.target.value)}
        >
          {["IDLE", "LOADING", "SENDING_EMAIL", "CONFIRM_EMAIL", "ERROR"].map(
            (status) => {
              return (
                <option key={status} value={status}>
                  {status}
                </option>
              );
            },
          )}
        </select>
        <div className="relative grid h-full place-items-center p-6">
          <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/20">
            <form onSubmit={onSubmit} className="space-y-2">
              <div className="flex h-16 items-center justify-between px-5 pt-5">
                <div className="flex items-center">
                  <img
                    src={project.icon}
                    alt="ZeeVerse"
                    className="h-full w-10 flex-shrink-0"
                  />
                  <div className="ml-2">
                    <h1 className="text-sm text-[#70747D]">Connect to</h1>
                    <h2 className="font-medium">{project.name}</h2>
                  </div>
                </div>
                <img src={logoImg} alt="ZeeVerse" className="h-12 w-auto" />
              </div>
              <ResizeablePanel>
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
                            characterSelected:
                              "border-[#DC2626] outline-[#DC2626]",
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
                    {!project.customAuth ? (
                      <>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <Button
                            variant="secondary"
                            className="flex items-center justify-center border border-[#E7E8E9]"
                            onClick={() => logInWithSSO("apple")}
                            disabled={isInputDisabled}
                          >
                            <AppleLogo className="h-6 w-6 text-[#474A50]" />
                            <span className="sr-only">Continue with Apple</span>
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex items-center justify-center border border-[#E7E8E9]"
                            onClick={() => logInWithSSO("google")}
                            disabled={isInputDisabled}
                          >
                            <AppleLogo className="h-6 w-6 text-[#474A50]" />
                            <span className="sr-only">
                              Continue with Google
                            </span>
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex items-center justify-center border border-[#E7E8E9]"
                            onClick={() => logInWithSSO("facebook")}
                            disabled={isInputDisabled}
                          >
                            <AppleLogo className="h-6 w-6 text-[#474A50]" />
                            <span className="sr-only">
                              Continue with GitHub
                            </span>
                          </Button>
                        </div>
                        <div className="mt-4 flex items-center">
                          <hr className="flex-1 border-t border-[#E7E8E9]" />
                          <p className="mx-2.5 text-center text-[#70747D]">
                            Or
                          </p>
                          <hr className="flex-1 border-t border-[#E7E8E9]" />
                        </div>
                      </>
                    ) : null}
                    <div className="mt-4 space-y-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-[#0A111C]"
                        >
                          Email
                        </label>
                        <input
                          {...register("email", { required: true })}
                          id="email"
                          type="email"
                          placeholder="Your Email"
                          className="w-full rounded-lg border border-[#dcdcdc] px-3 py-2.5 outline-[#DC2626] disabled:cursor-not-allowed"
                          disabled={isInputDisabled}
                        />
                      </div>
                      {project.customAuth ? (
                        <>
                          <div className="space-y-1.5">
                            <label
                              htmlFor="password"
                              className="block text-sm font-semibold text-[#0A111C]"
                            >
                              Password
                            </label>
                            <input
                              {...register("password", { required: true })}
                              id="password"
                              type="password"
                              placeholder="Your Password"
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
                        Connect
                      </Button>
                    </div>
                  </>
                )}
              </ResizeablePanel>
            </form>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
};

const ResizeablePanel = ({ children }) => {
  const [ref, { height }] = useMeasure();
  console.log(height);
  return (
    <motion.div
      // need this 1px for the initial height to not animate
      animate={{ height: height || "1px" }}
      className="relative overflow-hidden"
    >
      <AnimatePresence initial={false}>
        <motion.div
          initial={{
            opacity: 0,
            x: 382,
          }}
          animate={{
            opacity: 1,
            x: 0,
            transition: {
              duration: DURATION / 2,
              delay: DURATION / 2,
            },
          }}
          exit={{
            opacity: 0,
            x: -382,
            transition: { duration: DURATION / 2 },
          }}
          key={JSON.stringify(children, ignoreCircularReferences())}
        >
          <div
            className={`${height ? "absolute" : "relative"} w-full px-5 pb-5`}
            ref={ref}
          >
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

/*
  Replacer function to JSON.stringify that ignores
  circular references and internal React properties.
  https://github.com/facebook/react/issues/8669#issuecomment-531515508
*/
const ignoreCircularReferences = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (key.startsWith("_")) return; // Don't compare React's internal props.
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  };
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
