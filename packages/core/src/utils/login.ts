import type { ProjectSlug } from "../types";

export const createLoginUrl = ({
  project,
  chainId,
  domain,
  redirectUri,
}: {
  project: ProjectSlug;
  chainId: number;
  domain: string;
  redirectUri: string;
}) => `${domain}/${project}?redirect_uri=${redirectUri}&chain_id=${chainId}`;
