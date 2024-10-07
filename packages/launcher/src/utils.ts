export function getTreasureLauncherAuthToken(): string | undefined {
  let args: string[] | undefined;

  if (typeof process !== "undefined" && Array.isArray(process.argv)) {
    args = process.argv;
  } else if (
    typeof window !== "undefined" &&
    window.process &&
    Array.isArray(window.process.argv)
  ) {
    args = window.process.argv;
  } else {
    return undefined;
  }

  const arg = args.find((arg) => arg.startsWith("--tdk-auth-token="));
  return arg ? arg.split("=")[1] : undefined;
}

export function isUsingTreasureLauncher(): boolean {
  return !!getTreasureLauncherAuthToken();
}
