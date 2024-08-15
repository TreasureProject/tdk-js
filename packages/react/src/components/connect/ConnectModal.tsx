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

  const handleLogin = async (wallet: Wallet) => {
    try {
      await logIn(wallet);
      // Login was successful, close the connect modal
      onOpenChange(false);
    } catch (err) {
      console.error("Error logging in wallet:", err);
      setState({ email: "", isLoading: false, error: (err as Error).message });
      logOut();
    }
  };

  const handleConnectEmail = async (verificationCode: string) => {
    // Finish connecting with email and verification code
    setIsLoading();
    const wallet = (await connect(() =>
      connectWallet({
        client,
        chainId: chain.id,
        mode: "email",
        email,
        verificationCode,
      }),
    )) as Wallet;
    await handleLogin(wallet);
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
        setState((curr) => ({
          ...curr,
          isLoading: false,
          error: (err as Error).message,
        }));
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
    const wallet = (await connect(() =>
      connectWallet({
        client,
        chainId: chain.id,
        mode: method,
        redirectUrl,
        // redirectExternally,
      }),
    )) as Wallet;
    await handleLogin(wallet);
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
              onConnect={handleConnectEmail}
              onResend={() => sendEmailVerificationCode({ client, email })}
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
