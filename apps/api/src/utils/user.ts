import type { UserProfile } from "@prisma/client";
import type { GetUserResult } from "thirdweb";

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

export const parseThirdwebUserEmail = (user: GetUserResult) => {
  if (user.email) {
    return user.email;
  }

  const profileEmail = user.profiles.find(({ type }) => type === "email")
    ?.details.email;
  if (profileEmail) {
    return profileEmail;
  }

  for (const profile of user.profiles) {
    if (profile.details.email) {
      return profile.details.email;
    }
  }

  return undefined;
};
