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
  const { variant = "primary", size = "md" } = props;
  const className = cn(
    "focus:tdk-outline-none focus:tdk-ring-2 focus:tdk-ring-offset-2 disabled:tdk-cursor-not-allowed disabled:tdk-opacity-50 tdk-cursor-pointer tdk-rounded-lg tdk-px-4 tdk-py-2 tdk-font-medium tdk-transition-colors tdk-text-sm tdk-border tdk-border-solid",
    variant === "primary" &&
      "focus:tdk-ring-ruby-500 tdk-text-white tdk-border-ruby tdk-bg-ruby-700",
    variant === "secondary" &&
      "tdk-text-silver-200 tdk-border tdk-border-silver-700 hover:tdk-border-silver-600 hover:tdk-text-silver-100",
    variant === "ghost"
      ? "tdk-text-ruby-900 hover:tdk-text-ruby-1000"
      : "tdk-shadow-sm",
    size === "lg" && "tdk-px-5 tdk-py-2.5 tdk-text-base",
    props.className,
  );

  if (props.as === "link") {
    const { as: _, variant: __, ...linkProps } = props;
    return <a {...linkProps} className={className} />;
  }

  const { as: _, variant: __, ...buttonProps } = props;
  return <button {...buttonProps} className={className} />;
};
