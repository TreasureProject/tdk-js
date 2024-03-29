import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { forwardRef } from "react";

import { cn } from "../../utils/classnames";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "tdk-bg-[#FFFCF5] tdk-text-[#0A111C] data-[state=open]:tdk-animate-in data-[state=closed]:tdk-animate-out data-[state=closed]:tdk-fade-out-0 data-[state=open]:tdk-fade-in-0 data-[state=closed]:tdk-zoom-out-95 data-[state=open]:tdk-zoom-in-95 data-[side=bottom]:tdk-slide-in-from-top-2 data-[side=left]:tdk-slide-in-from-right-2 data-[side=right]:tdk-slide-in-from-left-2 data-[side=top]:tdk-slide-in-from-bottom-2 tdk-z-50 tdk-min-w-[8rem] tdk-overflow-hidden tdk-rounded-xl tdk-p-1.5",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "focus:tdk-bg-[#FDEBC0] focus:tdk-outline-none tdk-cursor-pointer tdk-select-none tdk-relative tdk-flex tdk-items-center tdk-px-2 tdk-py-1.5 tdk-text-sm tdk-outline-none data-[disabled]:tdk-pointer-events-none data-[disabled]:tdk-opacity-50 tdk-rounded-md",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
};
