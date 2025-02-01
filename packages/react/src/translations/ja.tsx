import type { Translation } from "./en";

const translation: Translation = {
  connect: {
    action: "接続",
    header: ({ appName }) => <>{appName} に接続する</>,
    footer: ({ thirdweb }) => <>提供元：{thirdweb}</>,
    option: {
      email: "メールアドレス",
      or: "または",
      apple: "Apple",
      discord: "Discord",
      google: "Google",
      passkey: "パスキー",
      wallet: "ウォレット",
      x: "X",
    },
    verify: {
      header: "コードを確認",
      description: ({ recipient }) => (
        <>
          {recipient}{" "}
          に確認コードを送信しました。コードを入力すると自動的にログインされます。
        </>
      ),
      inputLabel: "確認コードを入力してください：",
      action: "確認",
      resend: {
        prompt: "コードが届かない場合は？",
        action: "再送信",
        countdown: ({ seconds }: { seconds: number }) =>
          `${seconds}秒後に再送信可能...`,
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

export default translation;
