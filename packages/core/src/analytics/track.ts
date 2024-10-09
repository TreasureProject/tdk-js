import type { AnalyticsPayload } from "./types";

export function trackCustomEvent(
  apiUri: string,
  xApiKey: string,
  payloads: AnalyticsPayload[],
): Promise<void> {
  return fetch(`${apiUri}/ingress/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": xApiKey,
    },
    body: JSON.stringify(payloads),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to track custom event");
    }
  });
}
