import type { HTMLAttributes } from "react";

import { cn } from "../../utils";

type Props = HTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export const Button = ({
  className,
  variant = "primary",
  ...buttonProps
}: Props) => (
  <button
    className={cn(
      "focus:tdk-outline-none focus:tdk-ring-2 focus:tdk-ring-offset-2 disabled:tdk-cursor-not-allowed disabled:tdk-opacity-50 tdk-w-full tdk-cursor-pointer tdk-rounded-lg tdk-px-5 tdk-py-2.5 tdk-font-semibold tdk-shadow-sm tdk-transition-colors",
      variant === "primary" &&
        "focus:tdk-ring-ruby-500 tdk-bg-ruby-900 hover:tdk-bg-ruby-1000 tdk-text-white hover:tdk-text-white",
      variant === "secondary" &&
        "tdk-text-night-200 tdk-border tdk-border-night-700 hover:tdk-border-night-600 hover:tdk-text-night-100",
      className,
    )}
    {...buttonProps}
  />
);
