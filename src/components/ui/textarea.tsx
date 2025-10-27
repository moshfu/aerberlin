import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[140px] w-full rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,18,18,0.96)] px-4 py-3 text-sm text-foreground placeholder:text-[rgba(245,245,245,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,16,42,0.6)] focus-visible:ring-offset-0",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
