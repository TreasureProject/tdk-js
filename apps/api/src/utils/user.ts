import type { UserProfile } from "@prisma/client";

export const transformUserProfileResponseFields = (
  profile: Partial<UserProfile>,
) => ({
  tagModifiedAt: profile.tagModifiedAt?.toISOString() ?? null,
  tagLastCheckedAt: profile.tagLastCheckedAt?.toISOString() ?? null,
  emailSecurityPhraseUpdatedAt:
    profile.emailSecurityPhraseUpdatedAt?.toISOString() ?? null,
  testnetFaucetLastUsedAt:
    profile.testnetFaucetLastUsedAt?.toISOString() ?? null,
});
