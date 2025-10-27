import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.24em] transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "badge-frosted",
        accent: "badge-frosted bg-[rgba(255,16,42,0.18)] border-[rgba(255,16,42,0.5)] text-white",
        outline: "badge-frosted border-[rgba(255,255,255,0.24)]",
        muted: "badge-frosted bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.7)]",
        success: "badge-frosted bg-success/15 border-success/45 text-success",
        warning: "badge-frosted bg-warning/15 border-warning/45 text-warning",
        danger: "badge-frosted bg-danger/15 border-danger/45 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
