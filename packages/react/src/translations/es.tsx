import type { Translation } from "./en";

const translation: Translation = {
  connect: {
    action: "Conectar",
    header: ({ appName }) => <>Conectarse a {appName}</>,
    footer: ({ thirdweb }) => <>Con tecnología de {thirdweb}</>,
    option: {
      email: "Correo electrónico",
      or: "o",
      apple: "Apple",
      discord: "Discord",
      google: "Google",
      passkey: "Clave de paso",
      wallet: "Cartera",
      x: "X",
    },
    verify: {
      header: "Verificar código",
      description: ({ recipient }) => (
        <>
          Se envió un código de verificación a {recipient}. Iniciará sesión
          automáticamente después de ingresar su código.
        </>
      ),
      inputLabel: "Ingresar código de verificación:",
      action: "Confirmar",
      resend: {
        prompt: "¿No recibió un código?",
        action: "Reenviar",
        countdown: ({ seconds }: { seconds: number }) =>
          `Reenvío disponsible en ${seconds}s...`,
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
