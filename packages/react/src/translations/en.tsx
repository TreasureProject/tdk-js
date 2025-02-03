import type { ReactNode } from "react";

const translation = {
  connect: {
    action: "Connect",
    header: ({ appName }: { appName: ReactNode }) => <>Connect to {appName}</>,
    footer: ({ thirdweb }: { thirdweb: ReactNode }) => (
      <>Powered by {thirdweb}</>
    ),
    option: {
      email: "Email address",
      or: "or",
      apple: "Apple",
      discord: "Discord",
      google: "Google",
      passkey: "Passkey",
      wallet: "Wallet",
      x: "X",
    },
    verify: {
      header: "Verify code",
      description: ({ recipient }: { recipient: ReactNode }) => (
        <>
          We have sent a verification code to {recipient}. You will be
          automatically logged in after entering your code.
        </>
      ),
      inputLabel: "Enter verification code:",
      action: "Confirm",
      resend: {
        prompt: "Didn't get a code?",
        action: "Resend",
        countdown: ({ seconds }: { seconds: number }) =>
          `Resend available in ${seconds}s...`,
      },
    },
    migrate: {
      header: "Migrate existing account",
      description:
        "It looks like you have several existing Treasure profiles. Please choose one you would like to use moving forward as your identity across the Treasure ecosystem.",
      approve: "Use this account",
      reject: "Start fresh",
      disclaimer: "NOTE: This is irreversible, so please choose carefully.",
    },
  },
};

export type Translation = typeof translation;

export default translation;
