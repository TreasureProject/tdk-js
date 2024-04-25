export const getErrorMessage = (err: unknown) => {
  let message: string | undefined;

  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  }

  return message?.replace("Error: ", "");
};
