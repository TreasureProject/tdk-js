import type { AnalyticsPayload } from "./types";

export async function trackCustomEvent(
  apiUri: string,
  xApiKey: string,
  payloads: AnalyticsPayload[],
): Promise<void> {
  const response = await fetch(`${apiUri}/ingress/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": xApiKey,
    },
    body: JSON.stringify(payloads),
  });
  if (!response.ok) {
    throw new Error("Failed to track custom event");
  }
}
