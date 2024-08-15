import {
  type ConnectMethod,
  connectWallet,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";
import { useEffect, useState } from "react";
import { useConnect } from "thirdweb/react";
import type { Wallet } from "thirdweb/wallets";

import { useTreasure } from "../../contexts/treasure";
import { Dialog, DialogContent } from "../ui/Dialog";
import {
  type Options as ConnectMethodSelectionOptions,
  ConnectMethodSelectionView,
} from "./ConnectMethodSelectionView";
import { ConnectVerifyCodeView } from "./ConnectVerifyCodeView";

export type Options = ConnectMethodSelectionOptions & {
  authMode?: "popup" | "redirect";
  redirectUrl?: string;
  redirectExternally?: boolean;
};

type Props = Options & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_STATE = {
  email: "",
  isLoading: false,
  error: undefined,
};

export const ConnectModal = ({
  open,
  authMode,
  redirectUrl,
  redirectExternally,
  onOpenChange,
  ...methodSelectionProps
}: Props) => {
  const { appName, appIconUri, client, chain, logIn, logOut } = useTreasure();
  const [{ email, isLoading, error }, setState] = useState<{
    email: string;
    isLoading: boolean;
    error: string | undefined;
  }>(DEFAULT_STATE);
  const { connect } = useConnect();

  const setIsLoading = (isLoading = true) =>
    setState((curr) => ({ ...curr, isLoading }));

  const setError = (error: string, resetEmail = false) =>
    setState((curr) => ({
      email: resetEmail ? "" : curr.email,
      isLoading: false,
      error,
    }));

  const handleLogin = async (wallet: Wallet) => {
    try {
      await logIn(wallet);
      // Login was successful, close the connect modal
      onOpenChange(false);
    } catch (err) {
      console.error("Error logging in wallet:", err);
      setError((err as Error).message, true);
      logOut();
    }
  };

  const handleConnectEmail = async (verificationCode: string) => {
    // Finish connecting with email and verification code
    setIsLoading();

    let wallet: Wallet | undefined | null;
    try {
      wallet = await connect(() =>
        connectWallet({
          client,
          chainId: chain.id,
          method: "email",
          email,
          verificationCode,
        }),
      );
    } catch (err) {
      console.error("Error connecting wallet with email:", err);
      setError((err as Error).message);
    }

    if (wallet) {
      try {
        await handleLogin(wallet);
      } catch (err) {
        console.error("Error logging in wallet with email:", err);
        setError((err as Error).message);
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
        await sendEmailVerificationCode({ client, email: nextEmail });
        setState({ email: nextEmail, isLoading: false, error: undefined });
      } catch (err) {
        console.error("Error sending email verification code:", err);
        setError((err as Error).message);
      }

      return;
    }

    // Handle connecting with wallet
    if (method === "wallet") {
      // TODO: pop up Thirdweb Connect modal
      return;
    }

    // Handle connecting with social / passkey
    setIsLoading();

    let wallet: Wallet | undefined | null;
    try {
      wallet = await connect(() =>
        connectWallet({
          client,
          chainId: chain.id,
          method,
          authMode,
          redirectUrl,
          redirectExternally,
        }),
      );
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError((err as Error).message);
    }

    if (wallet) {
      try {
        await handleLogin(wallet);
      } catch (err) {
        console.error("Error logging in wallet:", err);
        setError((err as Error).message);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleResendEmailVerificationCode = async () => {
    try {
      await sendEmailVerificationCode({ client, email });
    } catch (err) {
      console.error("Error resending email verification code:", err);
      setError((err as Error).message);
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
      <DialogContent className="tdk-max-w-lg">
        <div className="tdk-rounded-lg tdk-overflow-hidden">
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
