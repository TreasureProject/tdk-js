import type {
  ConnectMethod,
  SocialConnectMethod,
  SocialConnectMethodMap,
} from "../types";

export function isSocialConnectMethod(
  method: ConnectMethod,
): method is SocialConnectMethod {
  const methodMap = {} as SocialConnectMethodMap;
  return method in methodMap;
}
