import { v4 as uuidv4 } from "uuid";

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
