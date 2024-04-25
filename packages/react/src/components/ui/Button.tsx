import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cn } from "../../utils/classnames";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
};

type AsButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
  };

type AsLinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "link";
  };

type Props = AsButtonProps | AsLinkProps;

export const Button = (props: Props) => {
  const className = cn(
    "focus:tdk-outline-none focus:tdk-ring-2 focus:tdk-ring-offset-2 disabled:tdk-cursor-not-allowed disabled:tdk-opacity-50 tdk-cursor-pointer tdk-rounded-lg tdk-px-4 tdk-py-2 tdk-font-medium tdk-transition-colors tdk-text-sm",
    (!props.variant || props.variant === "primary") &&
      "focus:tdk-ring-ruby-500 tdk-bg-ruby-1000 hover:tdk-bg-ruby-900 tdk-text-white hover:tdk-text-white",
    props.variant === "secondary" &&
      "tdk-text-night-200 tdk-border tdk-border-night-700 hover:tdk-border-night-600 hover:tdk-text-night-100",
    props.variant === "ghost"
      ? "tdk-text-ruby-900 hover:tdk-text-ruby-1000"
      : "tdk-shadow-sm",
    props.size === "lg" && "tdk-px-5 tdk-py-2.5 tdk-text-base",
    props.className,
  );

  if (props.as === "link") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _, variant: __, ...linkProps } = props;
    return <a {...linkProps} className={className} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _, variant: __, ...buttonProps } = props;
  return <button {...buttonProps} className={className} />;
};
