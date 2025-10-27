"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface SpinningMarkProps {
  size?: number;
  className?: string;
}

export function SpinningMark({ size = 64, className }: SpinningMarkProps) {
  return (
    <div
      className={cn(
        "spin-slow inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(18,18,18,0.92)] p-3 shadow-[0_18px_28px_rgba(0,0,0,0.35)] transition-transform",
        className,
      )}
      aria-hidden="true"
      style={{ width: size + 16, height: size + 16 }}
    >
      <Image
        src="/media/aer-logo.jpg"
        alt="aer berlin rotating mark"
        width={size}
        height={size}
        className="pointer-events-none select-none rounded-full object-cover"
        priority
      />
    </div>
  );
}
