import type { HTMLAttributes } from "react";

export type IconProps = HTMLAttributes<SVGElement> & {
  className?: string;
};

export * from "./ArbitrumTokenIcon";
export * from "./MagicStarsIcon";
export * from "./MagicTokenIcon";
