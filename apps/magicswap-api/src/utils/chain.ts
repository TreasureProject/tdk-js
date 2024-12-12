const CHAIN_SLUG_TO_ID = {
  "arbitrum-sepolia": 421614,
} as const;

const CHAIN_ID_TO_SLUG = Object.fromEntries(
  Object.entries(CHAIN_SLUG_TO_ID).map(([slug, id]) => [id, slug]),
) as Record<number, string>;

export const getChainId = (slug: string) =>
  slug in CHAIN_SLUG_TO_ID
    ? CHAIN_SLUG_TO_ID[slug as keyof typeof CHAIN_SLUG_TO_ID]
    : -1;

export const getChainSlug = (id: number) =>
  id in CHAIN_ID_TO_SLUG ? (CHAIN_ID_TO_SLUG[id] ?? "unknown") : "unknown";
