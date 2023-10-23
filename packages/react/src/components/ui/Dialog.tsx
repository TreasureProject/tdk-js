/* eslint-disable react/prop-types */
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "../../utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "tdk-fixed tdk-inset-0 tdk-z-50 tdk-bg-black/80 tdk-backdrop-blur-sm data-[state=open]:tdk-animate-in data-[state=closed]:tdk-animate-out data-[state=closed]:tdk-fade-out-0 data-[state=open]:tdk-fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "tdk-fixed tdk-left-[50%] tdk-top-[50%] tdk-z-50 tdk-w-full tdk-translate-x-[-50%] tdk-translate-y-[-50%] tdk-p-6 tdk-shadow-lg tdk-duration-200 data-[state=open]:tdk-animate-in data-[state=closed]:tdk-animate-out data-[state=closed]:tdk-fade-out-0 data-[state=open]:tdk-fade-in-0 data-[state=closed]:tdk-zoom-out-95 data-[state=open]:tdk-zoom-in-95 data-[state=closed]:tdk-slide-out-to-left-1/2 data-[state=closed]:tdk-slide-out-to-top-[48%] data-[state=open]:tdk-slide-in-from-left-1/2 data-[state=open]:tdk-slide-in-from-top-[48%]",
        className,
      )}
      {...props}
    >
      {children}
      {/* <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close> */}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
};
