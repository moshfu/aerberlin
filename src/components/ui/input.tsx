import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,18,18,0.96)] px-4 text-sm font-medium text-foreground placeholder:text-[rgba(245,245,245,0.45)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,16,42,0.6)] focus-visible:ring-offset-0",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
