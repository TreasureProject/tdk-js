import {
  SocialConnectMethodMap,
} from "../types";
import type {
  ConnectMethod,
} from "../types";

export function isSocialConnectMethod(
  method: ConnectMethod,
): boolean {
  return method in SocialConnectMethodMap;
}
