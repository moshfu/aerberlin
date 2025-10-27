"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * placeholder for the upcoming cloud logo svg.
 * spins and pulses with neon gradients for a Y2K vibe.
 */
export function SpinningCloudLogo({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches;
    let raf: number | null = null;
    let target = 1.08;
    let current = target;

    const tick = () => {
      current += (target - current) * 0.08;
      node.style.setProperty("--logo-pulse", current.toFixed(3));
      raf = window.requestAnimationFrame(tick);
    };

    const updateHover = (next: number) => {
      target = reduced ? 1 : next;
    };

    const handleEnter = () => updateHover(1.16);
    const handleLeave = () => updateHover(1.08);

    const start = () => {
      if (reduced || raf !== null) return;
      raf = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (raf !== null) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
      node.style.setProperty("--logo-pulse", reduced ? "1" : "1.08");
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (!reduced) {
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

    node.addEventListener("pointerenter", handleEnter);
    node.addEventListener("pointerleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    media.addEventListener("change", handleMediaChange);

    if (!reduced) {
      start();
    } else {
      node.style.setProperty("--logo-pulse", "1");
    }

    return () => {
      stop();
      node.removeEventListener("pointerenter", handleEnter);
      node.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      media.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("spinning-cloud-logo", className)}
    >
      <div className="spinning-cloud-logo__pulse" />
      <div className="spinning-cloud-logo__rim" />
      <div className="spinning-cloud-logo__cloud">
        <span className="spinning-cloud-logo__cloud-segment" />
        <span className="spinning-cloud-logo__cloud-segment" />
        <span className="spinning-cloud-logo__cloud-segment" />
      </div>
      <div className="spinning-cloud-logo__label">CLOUD HORSE</div>
    </div>
  );
}
