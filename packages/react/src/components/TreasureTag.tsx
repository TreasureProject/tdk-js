import { MagicStarsIcon } from "../icons/MagicStarsIcon";

type Props = {
  tag: string;
  withDiscriminant?: boolean;
};

export const TreasureTag = ({ tag, withDiscriminant = false }: Props) => {
  const [name, discriminant] = tag.split("#");
  return (
    <span>
      <MagicStarsIcon />
      <span>{name}</span>
      {withDiscriminant && discriminant ? (
        <span>#{discriminant}</span>
      ) : undefined}
    </span>
  );
};
