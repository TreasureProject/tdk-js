import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { Spinner } from "./Spinner";

type BaseProps = {
  variant?: "primary" | "secondary";
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

const buttonClassName = cva(
  [
    "tdk-rounded-lg tdk-px-4 tdk-py-1 tdk-transition-colors tdk-text-sm tdk-border tdk-border-solid tdk-min-h-9 disabled:tdk-cursor-not-allowed disabled:tdk-opacity-90",
  ],
  {
    variants: {
      intent: {
        primary: [
          "tdk-text-cream tdk-border-ruby-600 tdk-bg-ruby-700 hover:tdk-border-ruby-400 hover:tdk-bg-ruby-500 active:tdk-border-ruby-700 active:tdk-bg-ruby-800 disabled:hover:tdk-border-ruby-600 disabled:hover:tdk-bg-ruby-700",
        ],
        secondary: [
          "tdk-text-black tdk-border-honey-400 tdk-bg-honey-500 hover:tdk-border-honey-300 hover:tdk-bg-honey-400 active:tdk-border-honey-500 active:tdk-bg-honey-800 disabled:hover:tdk-border-honey-400 disabled:hover:tdk-bg-honey-500",
        ],
      },
      isLoading: {
        false: "tdk-cursor-pointer",
        true: "tdk-flex tdk-items-center tdk-justify-center tdk-cursor-wait",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        isLoading: true,
        class:
          "tdk-border-ruby-700 tdk-bg-ruby-800 hover:tdk-border-ruby-700 hover:tdk-bg-ruby-800",
      },
      {
        intent: "secondary",
        isLoading: true,
        class:
          "tdk-border-honey-500 tdk-bg-honey-800 hover:tdk-border-honey-500 hover:tdk-bg-honey-800",
      },
    ],
    defaultVariants: {
      intent: "primary",
      isLoading: false,
    },
  },
);

export const Button = (props: Props) => {
  const { variant = "primary", isLoading = false } = props;

  const children = isLoading ? (
    <Spinner className="tdk-w-3.5 tdk-h-3.5 tdk-mx-auto" />
  ) : (
    props.children
  );

  if (props.as === "link") {
    const { as: _, variant: __, isLoading: ___, ...linkProps } = props;
    return (
      <a
        {...linkProps}
        className={clsx(
          buttonClassName({ intent: variant, isLoading }),
          props.className,
        )}
      >
        {children}
      </a>
    );
  }

  const { as: _, variant: __, isLoading: ___, ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      className={clsx(
        buttonClassName({
          intent: variant,
          isLoading,
        }),
        buttonProps.className,
      )}
      onClick={isLoading ? undefined : props.onClick}
    >
      {children}
    </button>
  );
};
