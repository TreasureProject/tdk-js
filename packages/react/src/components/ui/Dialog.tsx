import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../icons/CloseIcon";
import { cn } from "../../utils/classnames";

const Dialog = DialogPrimitive.Root;

const DialogPortal = DialogPrimitive.Portal;

const DialogTitle = DialogPrimitive.Title;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "tdk-fixed tdk-inset-0 tdk-z-50 tdk-bg-black/30 tdk-backdrop-blur-sm data-[state=open]:tdk-animate-in data-[state=closed]:tdk-animate-out data-[state=closed]:tdk-fade-out-0 data-[state=open]:tdk-fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "tdk-fixed tdk-max-h-screen tdk-p-4 sm:tdk-px-6 tdk-overflow-y-auto tdk-left-1/2 tdk-top-1/2 tdk-z-50 tdk-w-full -tdk-translate-x-1/2 -tdk-translate-y-1/2 tdk-border tdk-border-night-600 tdk-shadow-none tdk-drop-shadow-xl data-[state=open]:tdk-animate-in data-[state=closed]:tdk-animate-out data-[state=closed]:tdk-fade-out-0 data-[state=open]:tdk-fade-in-0 data-[state=closed]:tdk-zoom-out-95 data-[state=open]:tdk-zoom-in-95 data-[state=closed]:tdk-slide-out-to-left-1/2 data-[state=closed]:tdk-slide-out-to-top-[48%] data-[state=open]:tdk-slide-in-from-left-1/2 data-[state=open]:tdk-slide-in-from-top-[48%] tdk-outline-none focus:tdk-outline-none focus:tdk-ring-0",
          className,
        )}
        {...props}
      >
        <div className="tdk-relative">
          <DialogPrimitive.Close className="tdk-absolute tdk-top-0 tdk-right-0 tdk-pt-4 tdk-pr-4 tdk-pb-2 tdk-pl-2 tdk-bg-transparent tdk-border-none tdk-cursor-pointer tdk-group">
            <CloseIcon className="tdk-h-5 tdk-w-5 tdk-text-silver-300 group-hover:tdk-text-cream tdk-transition-colors" />
            <span className="tdk-sr-only">{t("common.close")}</span>
          </DialogPrimitive.Close>
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogContent, DialogTitle };
