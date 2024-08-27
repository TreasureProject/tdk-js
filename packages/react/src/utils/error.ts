export const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);
