import type { AnalyticsPayload, AppInfo, PropertyValue } from "./types";
import { getServerTime } from "./utils";

export async function trackCustomEvent(
  apiUri: string,
  xApiKey: string,
  event: {
    cartridge_tag: string;
    name: string;
    smart_account: string;
    properties: { [key: string]: PropertyValue | PropertyValue[] };
    app: AppInfo;
  },
): Promise<void> {
  const serverTime = await getServerTime(apiUri);
  const localTime = Date.now();
  const payload: AnalyticsPayload = {
    ...event,
    id: "123",
    user_id: undefined,
    time_server: serverTime,
    time_local: localTime,
  };

  const response = await fetch(`${apiUri}/ingress/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": xApiKey,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to track custom event");
  }
}
