import { v4 as uuidv4 } from "uuid";
import { getDeviceUniqueId } from "./storage";
import type { Device } from "./types";

export async function getServerTime(apiUri: string): Promise<string> {
  const result = await fetch(`${apiUri}/utils/time-unix`);
  if (!result.ok) {
    throw new Error("Failed to get server time");
  }

  return result.text();
}

export function getEventId(): string {
  return `event-${uuidv4()}`;
}

export function getDevice(): Device | undefined {
  if (typeof window !== "undefined" && window.navigator) {
    const deviceID = getDeviceUniqueId();
    return {
      device_unique_id: deviceID,
      device_os: navigator.userAgent.includes("Windows")
        ? "Windows"
        : navigator.userAgent.includes("Mac")
          ? "MacOS"
          : navigator.userAgent.includes("Linux")
            ? "Linux"
            : "Unknown",
    };
  }
  return undefined;
}
