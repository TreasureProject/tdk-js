import type { IconName } from "../../icons/name";
import href from "../../icons/sprite.svg";

export const Icon = ({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) => (
  <svg className={className}>
    <use href={`${href}#${name}`} />
  </svg>
);
