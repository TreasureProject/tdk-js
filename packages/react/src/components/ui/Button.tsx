import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cn } from "../../utils/classnames";
import { Spinner } from "./Spinner";

type BaseProps = {
  variant?: "primary" | "secondary" | "tertiary";
  isLoading?: boolean;
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
  const { variant = "primary", isLoading = false } = props;
  const className = cn(
    "tdk-rounded-lg tdk-px-4 tdk-py-1 tdk-font-medium tdk-transition-colors tdk-text-sm tdk-border tdk-border-solid tdk-min-h-9",
    isLoading
      ? "tdk-flex tdk-items-center tdk-justify-center tdk-cursor-wait"
      : "tdk-cursor-pointer",
    variant === "primary" &&
      "tdk-text-cream tdk-border-ruby-600 tdk-bg-ruby-700 hover:tdk-border-ruby-400 hover:tdk-bg-ruby-500 active:tdk-border-ruby-700 active:tdk-bg-ruby-800",
    variant === "primary" &&
      isLoading &&
      "tdk-border-ruby-700 tdk-bg-ruby-800 hover:tdk-border-ruby-700 hover:tdk-bg-ruby-800",
    variant === "secondary" &&
      "tdk-text-black tdk-border-honey-400 tdk-bg-honey-500 hover:tdk-border-honey-300 hover:tdk-bg-honey-400 active:tdk-border-honey-500 active:tdk-bg-honey-800",
    variant === "secondary" &&
      isLoading &&
      "tdk-border-honey-500 tdk-bg-honey-800 hover:tdk-border-honey-500 hover:tdk-bg-honey-800",
    variant === "tertiary" &&
      "tdk-text-cream tdk-border-night-400 tdk-bg-night-500 hover:tdk-border-night-200 hover:tdk-bg-night-300 active:tdk-border-night-400 active:tdk-bg-night-600",
    variant === "tertiary" &&
      isLoading &&
      "tdk-border-night-400 tdk-bg-night-600 hover:tdk-border-night-400 hover:tdk-bg-night-600",
    "disabled:tdk-cursor-not-allowed disabled:tdk-text-cream disabled:tdk-border-night-600 disabled:tdk-bg-night-900",
    props.className,
  );

  const children = isLoading ? (
    <Spinner className="tdk-w-3.5 tdk-h-3.5 tdk-mx-auto" />
  ) : (
    props.children
  );

  if (props.as === "link") {
    const { as: _, variant: __, isLoading: ___, ...linkProps } = props;
    return (
      <a {...linkProps} className={className}>
        {children}
      </a>
    );
  }

  const { as: _, variant: __, isLoading: ___, ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      className={className}
      onClick={isLoading ? undefined : props.onClick}
    >
      {children}
    </button>
  );
};
