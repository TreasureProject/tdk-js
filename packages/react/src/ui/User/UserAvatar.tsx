import { Blobbie } from "thirdweb/react";

type Props = {
  address: string;
  pfp?: string | null;
  className?: string;
};

export const UserAvatar = ({ address, pfp, className }: Props) =>
  pfp ? (
    <img src={pfp} alt="" className={className} />
  ) : (
    <Blobbie address={address} className={className} />
  );
