import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  type ConnectMethod,
  DEFAULT_TDK_APP_ICON_URI,
  SUPPORTED_WEB3_WALLETS,
  type SocialConnectMethod,
  connectEcosystemWallet,
  isSocialConnectMethod,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";
import { useEffect, useState } from "react";
import { useConnect, useConnectModal } from "thirdweb/react";
import { type Wallet, authenticate } from "thirdweb/wallets";

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
import { ConnectVerifyCodeView } from "./ConnectVerifyCodeView";

export type Options = ConnectMethodSelectionOptions & {
  authMode?: "popup" | "redirect";
  redirectUrl?: string;
  passkeyDomain?: string;
  passkeyName?: string;
  hasStoredPasskey?: boolean;
  onConnected?: (method: ConnectMethod, wallet: Wallet) => void;
  onConnectError?: (method: ConnectMethod, err: unknown) => void;
};

export type Props = Options & {
  open: boolean;
  size?: "lg" | "xl" | "2xl" | "3xl";
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_STATE = {
  email: "",
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
    contractAddresses,
    logIn,
    logOut,
  } = useTreasure();
  const accountAbstraction = {
    chain,
    factoryAddress: contractAddresses.ManagedAccountFactory,
    sponsorGas: true,
  };
  const [{ email, isLoading, error }, setState] = useState<{
    email: string;
    isLoading: boolean;
    error: string | undefined;
  }>(DEFAULT_STATE);
  const { connect } = useConnect({
    client,
    accountAbstraction,
  });
  const { connect: connectWeb3Wallet } = useConnectModal();

  const setIsLoading = (isLoading = true) =>
    setState((curr) => ({
      ...curr,
      isLoading,
      error: isLoading ? undefined : curr.error,
    }));

  const setError = (err: unknown, resetEmail = false) =>
    setState((curr) => ({
      email: resetEmail ? "" : curr.email,
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
        await logIn(wallet);
        // Login was successful, close the connect modal
        onConnected?.("email", wallet);
        onOpenChange(false);
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
        setState({ email: nextEmail, isLoading: false, error: undefined });
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
        wallet = await connectWeb3Wallet({
          client,
          locale: getLocaleId(),
          wallets: SUPPORTED_WEB3_WALLETS,
          appMetadata: {
            name: appName,
            logoUrl: appIconUri,
          },
          accountAbstraction,
        });
      } catch (err) {
        // Error can be undefined if user closed the connect modal
        if (err) {
          console.error("Error connecting Web3 wallet:", err);
          setError(err);
          onConnectError?.(method, err);
        }
      }
    } else if (
      (redirectUrl || authMode === "redirect") &&
      isSocialConnectMethod(method)
    ) {
      // When redirectUrl is set or authMode is set to redirect
      // can use the headless `authenticate` function instead of connect
      // and it will redirect out of the app here
      try {
        await authenticate({
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
        await logIn(wallet);
        // Login was successful, close the connect modal
        onConnected?.(method, wallet);
        onOpenChange(false);
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
            {email ? (
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
          {email ? (
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
