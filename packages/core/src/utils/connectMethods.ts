import {
  SocialConnectMethodMap,
} from "../types";
import type {
  ConnectMethod,
} from "../types";

export function isSocialConnectMethod(
  method: ConnectMethod,
): boolean {
  console.log(method in SocialConnectMethodMap);
  return method in SocialConnectMethodMap;
}
