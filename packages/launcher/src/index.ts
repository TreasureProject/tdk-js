export function getTreasureLauncherAuthToken(): string | undefined {
  const windowAuthToken = window.location.search.match(
    /--tdk-auth-token=(\w+)/,
  )?.[1];
  const processBackendWallet = process.argv
    .find((arg) => arg.startsWith("--tdk-auth-token="))
    ?.split("=")[1];
  return windowAuthToken || processBackendWallet;
}

export function isUsingTreasureLauncher(): boolean {
  return !!getTreasureLauncherAuthToken();
}

export { startUserSessionViaLauncher } from "./session";
