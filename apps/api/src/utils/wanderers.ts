import type { LoginCustomReply } from "../schema";

const WANDERERS_API_URL = "https://id.wanderers.ai/sessions/whoami";

type WanderersSession = {
  active: boolean;
  expires_at: string;
  identity: {
    id: string;
    traits: {
      email: string;
    };
  };
};

export const validateWanderersUser = async (
  cookie?: string,
  token?: string,
): Promise<LoginCustomReply | undefined> => {
  const response = await fetch(WANDERERS_API_URL, {
    headers: cookie ? { Cookie: cookie } : { "X-Session-Token": token ?? "" },
  });

  const session: WanderersSession = await response.json();
  const expiresAt = new Date(session.expires_at).getTime();
  if (!session.active || expiresAt < Date.now()) {
    return undefined;
  }

  return {
    userId: session.identity.id,
    email: session.identity.traits.email,
    exp: Math.floor(expiresAt / 1000),
  };
};
