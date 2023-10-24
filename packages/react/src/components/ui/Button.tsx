import type { HTMLAttributes } from "react";

import { cn } from "../../utils";

type Props = HTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

export const Button = ({ className, ...buttonProps }: Props) => (
  <button
    className={cn(
      "tdk-border-ruby-900 focus:tdk-ring-ruby-500 tdk-bg-ruby-900 hover:tdk-bg-ruby-1000 tdk-w-full tdk-cursor-pointer tdk-rounded-lg tdk-border-2 tdk-px-5 tdk-py-2 tdk-font-semibold tdk-text-white tdk-shadow-sm tdk-transition-colors tdk-duration-500 hover:tdk-text-white focus:tdk-outline-none focus:tdk-ring-2 focus:tdk-ring-offset-2 disabled:tdk-cursor-not-allowed disabled:tdk-opacity-50",
      className,
    )}
    {...buttonProps}
  />
);
