import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  type ConnectMethod,
  DEFAULT_TDK_APP_ICON_URI,
  type LegacyProfile,
  SUPPORTED_WEB3_WALLETS,
  type SocialConnectMethod,
  type User,
  connectEcosystemWallet,
  isSocialConnectMethod,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";
import { useEffect, useState } from "react";
import { useConnect, useConnectModal } from "thirdweb/react";
import { type Wallet, authenticateWithRedirect } from "thirdweb/wallets";

import { Trans, useTranslation } from "react-i18next";
import { useTreasure } from "../../contexts/treasure";
import { getLocaleId } from "../../i18n";
import { cn } from "../../utils/classnames";
import { getErrorMessage } from "../../utils/error";
import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";
import {
  type Options as ConnectMethodSelectionOptions,
  ConnectMethodSelectionView,
} from "./ConnectMethodSelectionView";
import { ConnectMigrateUserView } from "./ConnectMigrateUserView";
import { ConnectVerifyCodeView } from "./ConnectVerifyCodeView";

export type Options = ConnectMethodSelectionOptions & {
  authMode?: "popup" | "redirect";
  redirectUrl?: string;
  passkeyDomain?: string;
  passkeyName?: string;
  hasStoredPasskey?: boolean;
  onConnected?: (method: ConnectMethod, wallet: Wallet, user?: User) => void;
  onConnectError?: (method: ConnectMethod, err: unknown) => void;
};

export type Props = Options & {
  open: boolean;
  size?: "lg" | "xl" | "2xl" | "3xl";
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_STATE = {
  email: "",
  legacyProfiles: [],
  isLoading: false,
  error: undefined,
};

export const ConnectModal = ({
  open,
  size = "lg",
  authMode,
  redirectUrl,
  passkeyDomain,
  passkeyName,
  hasStoredPasskey,
  onOpenChange,
  onConnected,
  onConnectError,
  ...methodSelectionProps
}: Props) => {
  const { t } = useTranslation();
  const {
    appName,
    appIconUri = DEFAULT_TDK_APP_ICON_URI,
    client,
    ecosystemId,
    ecosystemPartnerId,
    chain,
    tdk,
    logIn,
    logOut,
    updateUser,
  } = useTreasure();
  const [{ email, legacyProfiles, isLoading, error }, setState] = useState<{
    email: string;
    legacyProfiles: LegacyProfile[];
    isLoading: boolean;
    error: string | undefined;
  }>(DEFAULT_STATE);
  const { connect } = useConnect({
    client,
  });
  const { connect: connectWeb3Wallet } = useConnectModal();

  const isMigrating = legacyProfiles.length > 1;

  const setIsLoading = (isLoading = true) =>
    setState((curr) => ({
      ...curr,
      isLoading,
      error: isLoading ? undefined : curr.error,
    }));

  const setError = (err: unknown, resetEmail = false) =>
    setState((curr) => ({
      email: resetEmail ? "" : curr.email,
      legacyProfiles: [],
      isLoading: false,
      error: getErrorMessage(err),
    }));

  const handleConnectEmail = async (verificationCode: string) => {
    // Finish connecting with email and verification code
    setIsLoading();

    let wallet: Wallet | undefined | null;
    try {
      const ecosystemWallet = await connectEcosystemWallet({
        client,
        ecosystemId,
        ecosystemPartnerId,
        chainId: chain.id,
        method: "email",
        email,
        verificationCode,
      });
      wallet = await connect(ecosystemWallet);
    } catch (err) {
      console.error("Error connecting wallet with email:", err);
      setError(err);
      onConnectError?.("email", err);
    }

    if (wallet) {
      try {
        const { user, legacyProfiles } = await logIn(wallet);
        if (legacyProfiles.length > 1) {
          // User has a legacy profile migration choice
          setState((curr) => ({ ...curr, isLoading: false, legacyProfiles }));
        } else {
          // Nothing to migrate, close the connect modal
          onOpenChange(false);
        }

        onConnected?.("email", wallet, user);
      } catch (err) {
        console.error("Error logging in wallet with email:", err);
        setError(err, true);
        onConnectError?.("email", err);
        logOut();
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleConnect = async (method: ConnectMethod, nextEmail?: string) => {
    // Handle connecting with email
    if (method === "email") {
      if (!nextEmail) {
        throw new Error("Email is required");
      }

      // Send verification code and update state to show verification view
      setIsLoading();
      try {
        await sendEmailVerificationCode({
          client,
          ecosystemId,
          ecosystemPartnerId,
          email: nextEmail,
        });
        setState({
          email: nextEmail,
          legacyProfiles: [],
          isLoading: false,
          error: undefined,
        });
      } catch (err) {
        console.error("Error sending email verification code:", err);
        setError(err);
        onConnectError?.("email", err);
      }

      return;
    }

    setIsLoading();
    let wallet: Wallet | undefined | null;

    // Handle connecting with wallet
    if (method === "wallet") {
      try {
        const web3Wallet = await connectWeb3Wallet({
          client,
          locale: getLocaleId(),
          wallets: SUPPORTED_WEB3_WALLETS,
          appMetadata: {
            name: appName,
            logoUrl: appIconUri,
          },
          size: "compact",
        });
        const ecosystemWallet = await connectEcosystemWallet({
          client,
          ecosystemId,
          ecosystemPartnerId,
          chainId: chain.id,
          method: "wallet",
          wallet: web3Wallet,
        });
        wallet = await connect(ecosystemWallet);
      } catch (err) {
        // Error can be undefined if user closed the connect modal
        if (err) {
          console.error(
            "Error connecting ecosystem wallet with Web3 wallet:",
            err,
          );
          setError(err);
          onConnectError?.(method, err);
        }
      }
    } else if (
      (redirectUrl || authMode === "redirect") &&
      isSocialConnectMethod(method)
    ) {
      // When redirectUrl is set or authMode is set to redirect
      // can use the headless `authenticateWithRedirect` function instead of connect
      // and it will redirect out of the app here
      try {
        await authenticateWithRedirect({
          client,
          ecosystem: {
            id: ecosystemId,
            partnerId: ecosystemPartnerId,
          },
          strategy: method as SocialConnectMethod,
          redirectUrl,
          mode: authMode,
        });
      } catch (err) {
        console.error("Error connecting ecosystem wallet with redirect:", err);
        setError(err);
        onConnectError?.(method, err);
      }
    } else if (method === "auth_endpoint") {
      throw new Error(
        "Auth endpoint not supported in Treasure Connect modal. Use TDK Core package to connect.",
      );
    } else {
      // Handle connecting with social / passkey
      try {
        const ecosystemWallet = await connectEcosystemWallet({
          client,
          ecosystemId,
          ecosystemPartnerId,
          chainId: chain.id,
          method,
          authMode: "popup",
          redirectUrl,
          ...(method === "passkey" && {
            passkeyDomain,
            passkeyName,
            hasStoredPasskey,
          }),
        });
        wallet = await connect(ecosystemWallet);
      } catch (err) {
        console.error("Error connecting ecosystem wallet:", err);
        setError(err);
        onConnectError?.(method, err);
      }
    }

    if (wallet) {
      try {
        const { user, legacyProfiles } = await logIn(wallet);
        if (legacyProfiles.length > 1) {
          // User has a legacy profile migration choice
          setState((curr) => ({ ...curr, isLoading: false, legacyProfiles }));
        } else {
          // Nothing to migrate, close the connect modal
          onOpenChange(false);
        }

        onConnected?.(method, wallet, user);
      } catch (err) {
        console.error("Error logging in wallet:", err);
        setError(err);
        onConnectError?.(method, err);
        logOut();
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleResendEmailVerificationCode = async () => {
    try {
      await sendEmailVerificationCode({
        client,
        ecosystemId,
        ecosystemPartnerId,
        email,
      });
    } catch (err) {
      console.error("Error resending email verification code:", err);
      setError(err);
      onConnectError?.("email", err);
    }
  };

  const handleMigrateUser = async ({
    legacyProfileId,
    rejected = false,
  }: { legacyProfileId: string; rejected?: boolean }) => {
    try {
      const updatedUser = await tdk.user.migrate({
        id: legacyProfileId,
        rejected,
      });
      updateUser(updatedUser);
    } catch (err) {
      console.error("Error migrating user:", err);
      setError(err);
      return;
    }

    // Migration complete, close the connect modal
    onOpenChange(false);
  };

  // Reset modal state when it's opened
  useEffect(() => {
    if (open) {
      setState(DEFAULT_STATE);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          size === "lg" && "tdk-max-w-lg",
          size === "xl" && "tdk-max-w-xl",
          size === "2xl" && "tdk-max-w-2xl",
          size === "3xl" && "tdk-max-w-3xl",
        )}
        aria-describedby={undefined}
      >
        <VisuallyHidden.Root>
          <DialogTitle>
            {isMigrating ? (
              t("connect.migrate.header")
            ) : email ? (
              t("connect.verify.header")
            ) : (
              <Trans i18nKey="connect.header" values={{ appName }}>
                <span>Connect to</span>
                <span>{appName}</span>
              </Trans>
            )}
          </DialogTitle>
        </VisuallyHidden.Root>
        <div className="tdk-rounded-lg tdk-overflow-hidden tdk-bg-night tdk-border tdk-border-night-600">
          {isMigrating ? (
            <ConnectMigrateUserView
              legacyProfiles={legacyProfiles}
              isLoading={isLoading}
              error={error}
              onApprove={(legacyProfileId) =>
                handleMigrateUser({ legacyProfileId })
              }
              onReject={(legacyProfileId) =>
                handleMigrateUser({ legacyProfileId, rejected: true })
              }
            />
          ) : email ? (
            <ConnectVerifyCodeView
              recipient={email}
              isLoading={isLoading}
              error={error}
              onConfirm={handleConnectEmail}
              onResend={handleResendEmailVerificationCode}
            />
          ) : (
            <ConnectMethodSelectionView
              appName={appName}
              appIconUri={appIconUri}
              isLoading={isLoading}
              error={error}
              onConnect={handleConnect}
              {...methodSelectionProps}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
