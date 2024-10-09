export async function getServerTime(apiUri: string): Promise<number> {
  const result = await fetch(`${apiUri}/utils/time-unix`);
  if (!result.ok) {
    throw new Error("Failed to get server time");
  }

  return Number(await result.text());
}
