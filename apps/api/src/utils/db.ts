import type { Prisma } from "@prisma/client";

export const USER_SELECT_FIELDS = {
  id: true,
  externalWalletAddress: true,
} as const satisfies Prisma.UserSelect;

export const USER_PROFILE_SELECT_FIELDS = {
  email: true,
  tag: true,
  discriminant: true,
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

export const USER_SMART_ACCOUNT_SELECT_FIELDS = {
  chainId: true,
  address: true,
} as const satisfies Prisma.UserSmartAccountSelect;

export const USER_SMART_ACCOUNT_INCLUDE_FIELDS = {
  user: {
    select: {
      ...USER_SELECT_FIELDS,
      smartAccounts: {
        select: USER_SMART_ACCOUNT_SELECT_FIELDS,
      },
    },
  },
} as const satisfies Prisma.UserSmartAccountInclude;
