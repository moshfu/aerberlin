"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}


const buttonVariants = cva(
  "pixel-lock relative inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm,2px)] border border-transparent px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] transition-all duration-150 ease-[var(--transition-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[rgba(255,16,42,0.75)] focus-visible:ring-offset-[rgba(12,12,12,0.95)] disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "cta-glint border-accent/50 bg-accent text-background shadow-[0_0_28px_rgba(255,16,42,0.35)] hover:shadow-[0_0_38px_rgba(255,16,42,0.45)]",
        secondary:
          "border-[rgba(243,243,243,0.16)] bg-[rgba(18,18,18,0.85)] text-foreground hover:border-accent/45",
        outline:
          "border border-[rgba(243,243,243,0.24)] bg-transparent text-foreground hover:border-accent/55",
        ghost:
          "bg-transparent text-foreground hover:bg-accent/12",
        link: "border-none bg-transparent p-0 text-accent underline-offset-4 hover:underline",
        danger:
          "bg-danger text-background hover:brightness-110",
      },
      size: {
        xs: "px-4 py-2 text-[0.65rem]",
        sm: "px-5 py-2.5",
        md: "px-6 py-3",
        lg: "px-8 py-3.5 text-[0.78rem]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onMouseMove,
      onMouseLeave,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const internalRef = React.useRef<HTMLButtonElement | null>(null);
    const prefersReducedMotion = React.useRef(false);
    const beamSweep = Object.prototype.hasOwnProperty.call(props, "data-beam");

    React.useEffect(() => {
      if (asChild || variant !== "primary") return;
      const node = internalRef.current;
      if (!node || node.dataset.glintSeen === "true") return;

      let timeout: number | undefined;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && node.dataset.glintSeen !== "true") {
              node.dataset.glintSeen = "true";
              node.classList.add("cta-glint-active");
              timeout = window.setTimeout(() => {
                node.classList.remove("cta-glint-active");
              }, 650);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.6 },
      );

      observer.observe(node);
      return () => {
        observer.disconnect();
        if (timeout) window.clearTimeout(timeout);
      };
    }, [asChild, variant]);

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const update = () => {
        prefersReducedMotion.current = media.matches;
      };
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }, []);

    const targetRef = composeRefs<HTMLButtonElement>(
      !asChild ? (internalRef as React.Ref<HTMLButtonElement>) : undefined,
      ref,
    );

    const triggerBeamSweep = (target: EventTarget | null) => {
      if (!beamSweep || prefersReducedMotion.current) return;
      const element = target as HTMLElement | null;
      if (!element || !("classList" in element)) return;
      element.classList.remove("beam-active");
      // force reflow
      void element.offsetWidth;
      element.classList.add("beam-active");
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(event);
      if (prefersReducedMotion.current) return;
      const node = internalRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      node.style.setProperty("--hover-x", `${Math.round(x)}px`);
      node.style.setProperty("--hover-y", `${Math.round(y)}px`);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(event);
      const node = internalRef.current;
      if (!node) return;
      node.style.removeProperty("--hover-x");
      node.style.removeProperty("--hover-y");
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={targetRef}
        data-laser-pulse={variant === "primary" ? "" : undefined}
        onMouseMove={(event) => {
          if (!asChild) handleMouseMove(event as React.MouseEvent<HTMLButtonElement>);
          onMouseMove?.(event as React.MouseEvent<HTMLButtonElement>);
        }}
        onMouseLeave={(event) => {
          if (!asChild) handleMouseLeave(event as React.MouseEvent<HTMLButtonElement>);
          onMouseLeave?.(event as React.MouseEvent<HTMLButtonElement>);
        }}
        onPointerDown={(event) => {
          triggerBeamSweep(event.currentTarget);
          onPointerDown?.(event as React.PointerEvent<HTMLButtonElement>);
        }}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
