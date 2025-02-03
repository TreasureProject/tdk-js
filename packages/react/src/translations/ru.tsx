import type { Translation } from "./en";

const translation: Translation = {
  connect: {
    action: "Подключиться",
    header: ({ appName }) => <>Подключиться к {appName}</>,
    footer: ({ thirdweb }) => <>На платформе {thirdweb}</>,
    option: {
      email: "Электронный адрес",
      or: "или",
      apple: "Apple",
      discord: "Discord",
      google: "Google",
      passkey: "Ключ доступа",
      wallet: "Кошелёк",
      x: "X",
    },
    verify: {
      header: "Проверить код",
      description: ({ recipient }) => (
        <>
          Отправили код проверки на {recipient}. После ввода кода, Вы будете
          автоматически авторизованы.
        </>
      ),
      inputLabel: "Введите код проверки:",
      action: "Подтвердить",
      resend: {
        prompt: "Не получили код?",
        action: "Отправить повторно",
        countdown: ({ seconds }: { seconds: number }) =>
          `Повторная отправка возможна через ${seconds} сек...`,
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
