"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;
const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  side?: "left" | "right" | "top" | "bottom";
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex h-full w-full max-w-xs flex-col gap-8 border border-[rgba(255,255,255,0.1)] bg-[rgba(12,12,12,0.96)] p-6 text-foreground shadow-[0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-lg data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "right" && "inset-y-0 right-0",
        side === "left" && "inset-y-0 left-0",
        className,
      )}
      {...props}
    >
      <SheetClose className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.18)] text-muted transition-colors hover:border-[rgba(255,16,42,0.4)] hover:text-foreground">
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetClose>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
};
