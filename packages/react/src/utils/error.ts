export const getErrorMessage = (err: unknown) => {
  let message = err instanceof Error ? err.message : String(err);

  // Handle wallet connect errors in the format
  // {code: 5000, message: '{"code":4001,"message":"User rejected the request."}'}
  if (err instanceof Object) {
    const outerMessage = (err as { message: string }).message;
    if (outerMessage) {
      try {
        const parsed = JSON.parse(outerMessage);
        if (parsed.message) {
          message = parsed.message;
        }
      } catch (_err) {
        message = outerMessage;
      }
    } else {
      message = JSON.stringify(err);
    }
  }

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
