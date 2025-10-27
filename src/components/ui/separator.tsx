"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

const Separator = (
  props: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
) => {
  const { className, orientation = "horizontal", decorative = true, ...rest } = props;
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border/60",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
};

export { Separator };
