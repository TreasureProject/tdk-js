import { cn } from "../../utils";

type Props = {
  selected?: boolean;
  className?: string;
  innerClassName?: string;
};

export const RadioButtonIcon = ({
  selected = false,
  className,
  innerClassName,
}: Props) => (
  <div
    className={cn(
      "tdk-flex tdk-h-5 tdk-w-5 tdk-items-center tdk-justify-center tdk-rounded-full tdk-border tdk-transition-colors",
      selected
        ? "tdk-border-transparent tdk-bg-ruby-900"
        : "tdk-border-[#192B44]",
      className,
    )}
  >
    <div
      className={cn(
        "tdk-h-4 tdk-w-4 tdk-rounded-full tdk-border-2 tdk-transition-colors",
        selected
          ? "tdk-bg-ruby-900  tdk-border-[#192B44]"
          : "tdk-border-transparent tdk-bg-transparent",
        innerClassName,
      )}
    />
  </div>
);
