import {
  type ConnectMethod,
  connectWallet,
  sendEmailVerificationCode,
} from "@treasure-dev/tdk-core";
import { useState } from "react";
import { useConnect } from "thirdweb/react";
import type { Wallet } from "thirdweb/wallets";

import { useTreasure } from "../../contexts/treasure";
import { ConnectMethodSelectionView } from "./ConnectMethodSelectionView";
import { ConnectVerifyCodeView } from "./ConnectVerifyCodeView";

type Props = {
  appName: string;
  appIconUri?: string;
};

export const ConnectModal = ({ appName, appIconUri }: Props) => {
  const { client, chain, logIn, logOut } = useTreasure();
  const [email, setEmail] = useState("");
  const { connect } = useConnect();

  const handleLogin = async (wallet: Wallet) => {
    try {
      await logIn(wallet);
    } catch (err) {
      logOut();
      console.error("Error logging in wallet:", err);
    }
  };

  const handleConnectEmail = async (verificationCode: string) => {
    const wallet = (await connect(() =>
      connectWallet({
        client,
        chainId: chain.id,
        mode: "email",
        email,
        verificationCode,
      }),
    )) as Wallet;
    handleLogin(wallet);
  };

  const handleConnect = async (method: ConnectMethod, nextEmail?: string) => {
    if (method === "email") {
      if (!nextEmail) {
        throw new Error("Email is required");
      }

      try {
        await sendEmailVerificationCode({ client, email: nextEmail });
        setEmail(nextEmail);
      } catch (err) {
        console.error("Error sending email verification code:", err);
      }
    } else if (method === "wallet") {
      // TODO: pop up Thirdweb Connect modal
    } else {
      const wallet = (await connect(() =>
        connectWallet({
          client,
          chainId: chain.id,
          mode: method,
        }),
      )) as Wallet;
      handleLogin(wallet);
    }
  };

  return (
    <div className="tdk-rounded-lg">
      {email ? (
        <ConnectVerifyCodeView
          recipient={email}
          onConnect={handleConnectEmail}
          onResend={() => {}}
        />
      ) : (
        <ConnectMethodSelectionView
          appName={appName}
          appIconUri={appIconUri}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
};
