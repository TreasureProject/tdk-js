import type { Prisma } from "@prisma/client";

export const USER_SELECT_FIELDS = {
  id: true,
  address: true,
  email: true,
} as const satisfies Prisma.UserSelect;

export const USER_PROFILE_SELECT_FIELDS = {
  tag: true,
  discriminant: true,
  tagClaimed: true,
  tagModifiedAt: true,
  tagLastCheckedAt: true,
  emailSecurityPhrase: true,
  emailSecurityPhraseUpdatedAt: true,
  featuredNftIds: true,
  featuredBadgeIds: true,
  highlyFeaturedBadgeId: true,
  about: true,
  pfp: true,
  banner: true,
  showMagicBalance: true,
  showEthBalance: true,
  showGemsBalance: true,
  testnetFaucetLastUsedAt: true,
} as const satisfies Prisma.UserProfileSelect;
