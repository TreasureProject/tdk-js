export type AccountDomainType = "ens" | "smol" | "treasuretag" | "address";

export type AccountDomainInfo = {
  name: string;
  pfp: string | null;
  banner: string | null;
};

export type AccountDomains = {
  address: string;
  ens?: AccountDomainInfo;
  smol?: AccountDomainInfo;
  treasuretag?: AccountDomainInfo;
  preferredDomainType?: AccountDomainType;
  discord?: { id: string; name: string };
  twitter?: { id: string; name: string };
  steam?: { id: string; name: string };
  twitch?: { id: string; name: string };
  pfp: string | null;
  banner?: string | null;
};
