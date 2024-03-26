import type { ProjectSlug } from "../types";

export const createLoginUrl = ({
  project,
  chainId,
  domain,
  redirectUri,
  data,
}: {
  project: ProjectSlug;
  chainId: number;
  domain: string;
  redirectUri: string;
  data?: string;
}) =>
  `${domain}/${project}?redirect_uri=${redirectUri}&chain_id=${chainId}${data ? `&data=${data}` : ""}`;
