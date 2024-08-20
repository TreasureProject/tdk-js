import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";
import { cn } from "../../utils/classnames";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "tdk-flex tdk-items-center tdk-gap-2 has-[:disabled]:tdk-opacity-50",
      containerClassName,
    )}
    className={cn("disabled:tdk-cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("tdk-flex tdk-items-center", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "tdk-relative tdk-flex tdk-h-10 tdk-w-10 tdk-items-center tdk-justify-center tdk-border-solid tdk-border-0 tdk-border-y tdk-border-r tdk-text-lg tdk-font-semibold tdk-bg-[#0C1420] tdk-border-night-200 tdk-text-cream tdk-transition-all first:tdk-rounded-l-md first:tdk-border-l last:tdk-rounded-r-md",
        isActive && "tdk-z-10 tdk-outline tdk-outline-silver-300",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="tdk-pointer-events-none tdk-absolute tdk-inset-0 tdk-flex tdk-items-center tdk-justify-center">
          <div className="tdk-h-4 tdk-w-px tdk-animate-caret-blink tdk-bg-foreground tdk-duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPGroup, InputOTPSlot };
