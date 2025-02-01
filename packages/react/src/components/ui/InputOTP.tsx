import clsx from "clsx";
import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName="tdk-flex tdk-items-center tdk-gap-2 has-[:disabled]:tdk-opacity-50"
    className={clsx("disabled:tdk-cursor-not-allowed", className)}
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
    className={clsx("tdk-flex tdk-items-center tdk-gap-3", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] ?? {};

  return (
    <div
      ref={ref}
      className={clsx(
        "tdk-relative tdk-flex tdk-h-14 tdk-w-14 tdk-items-center tdk-justify-center tdk-text-lg tdk-font-semibold tdk-bg-[#0C1420] tdk-border tdk-border-solid tdk-border-night-500 tdk-text-cream tdk-transition-all tdk-rounded-md",
        isActive && "tdk-z-10 tdk-ring-2 tdk-ring-night-300",
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
