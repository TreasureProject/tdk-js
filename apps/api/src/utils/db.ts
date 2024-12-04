import type { Prisma } from "@prisma/client";

export const USER_SELECT_FIELDS = {
  id: true,
} as const satisfies Prisma.UserSelect;

export const USER_PUBLIC_PROFILE_SELECT_FIELDS = {
  tag: true,
  discriminant: true,
  featuredNftIds: true,
  featuredBadgeIds: true,
  highlyFeaturedBadgeId: true,
  about: true,
  pfp: true,
  banner: true,
} as const satisfies Prisma.UserProfileSelect;

export const USER_PROFILE_SELECT_FIELDS = {
  ...USER_PUBLIC_PROFILE_SELECT_FIELDS,
  id: true,
  email: true,
  emailSecurityPhrase: true,
  emailSecurityPhraseUpdatedAt: true,
  showMagicBalance: true,
  showEthBalance: true,
  showGemsBalance: true,
  testnetFaucetLastUsedAt: true,
} as const satisfies Prisma.UserProfileSelect;

export const USER_SMART_ACCOUNT_SELECT_FIELDS = {
  chainId: true,
  address: true,
  ecosystemWalletAddress: true,
} as const satisfies Prisma.UserSmartAccountSelect;

export const USER_SOCIAL_ACCOUNT_SELECT_FIELDS = {
  network: true,
  accountId: true,
  accountName: true,
  accountHandle: true,
  isPublic: true,
} as const satisfies Prisma.UserSocialAccountSelect;

export const USER_NOTIFICATION_SETTINGS_SELECT_FIELDS = {
  type: true,
  threshold: true,
  isEnabledEmail: true,
  isEnabledInApp: true,
} as const satisfies Prisma.UserNotificationSettingsSelect;
