export const getErrorMessage = (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);

  // Skip displaying certain error messages
  if (
    // Sent from Thirdweb if the user closes the social login window
    message === "User closed login window" ||
    // Sent from passkey login if the user cancels the process
    (err instanceof Error && err.name === "NotAllowedError")
  ) {
    return "";
  }

  return message;
};
