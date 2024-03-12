import type { ProjectSlug } from "../types";

export const createLoginUrl = ({
  project,
  chainId,
  domain = "https://login.treasure.lol",
  redirectUri = window.location.href,
}: {
  project: ProjectSlug;
  chainId: number;
  domain?: string;
  redirectUri?: string;
}) => `${domain}/${project}?redirect_uri=${redirectUri}&chain_id=${chainId}`;
