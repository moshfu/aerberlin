"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type CloudHorseVariant = "hero" | "sticker";

export function CloudHorse({
  className,
  variant = "hero",
}: {
  className?: string;
  variant?: CloudHorseVariant;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches;
    let timeout: number | null = null;
    const clearWarp = () => {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
    };

    const scheduleWarp = () => {
      if (reduced) return;
      timeout = window.setTimeout(() => {
        node.classList.add("cloud-horse--warp");
        window.setTimeout(() => node.classList.remove("cloud-horse--warp"), 500);
        scheduleWarp();
      }, 4200 + Math.random() * 7800);
    };

    const start = () => {
      if (reduced) {
        node.style.animationPlayState = "paused";
        clearWarp();
        return;
      }
      node.style.animationPlayState = "running";
      if (timeout === null) {
        scheduleWarp();
      }
    };

    const stop = () => {
      node.style.animationPlayState = "paused";
      clearWarp();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const handleMediaChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) {
        stop();
      } else {
        start();
      }
    };

    start();

    document.addEventListener("visibilitychange", handleVisibility);
    media.addEventListener("change", handleMediaChange);

    return () => {
      clearWarp();
      document.removeEventListener("visibilitychange", handleVisibility);
      media.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const handleClick = () => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return;
    node.classList.add("cloud-horse--tilt");
    window.setTimeout(() => node.classList.remove("cloud-horse--tilt"), 520);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "cloud-horse group",
        variant === "sticker"
          ? "cloud-horse--sticker pointer-events-none"
          : "cursor-pointer",
        className,
      )}
      role={variant === "hero" ? "img" : undefined}
      aria-label={variant === "hero" ? "aer berlin emblem" : undefined}
      onClick={variant === "hero" ? handleClick : undefined}
    >
      <span className="cloud-horse__halo" />
      <span className="cloud-horse__cloud" />
      <span className="cloud-horse__horse">
        <svg
          viewBox="0 0 120 80"
          aria-hidden="true"
          className="h-full w-full"
        >
          <path
            d="M8 58 L26 26 L48 22 L66 8 L98 10 L110 22 L112 42 L100 62 L78 70 L62 58 L40 74 Z"
            fill="rgba(255, 16, 42, 0.85)"
            stroke="rgba(243,243,243,0.9)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="cloud-horse__trail" aria-hidden="true" />
    </div>
  );
}
