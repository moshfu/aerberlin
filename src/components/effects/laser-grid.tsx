"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function LaserGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") {
      return;
    }

    let frame: number | null = null;
    let strengthTarget = 0.22;
    let strength = strengthTarget;
    let lastScrollY = window.scrollY;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches;
    let unregisterPulseTargets: () => void = () => {};

    const setStrength = (value: number) => {
      node.style.setProperty("--laser-strength", value.toFixed(3));
    };

    const animate = () => {
      strength += (strengthTarget - strength) * 0.08;
      setStrength(strength);
      frame = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (reduced || frame !== null) return;
      node.style.animationPlayState = "running";
      frame = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      node.style.animationPlayState = "paused";
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        if (reduced) {
          setStrength(0.1);
        } else {
          start();
        }
      }
    };

    const handleScroll = () => {
      if (reduced) return;
      const delta = Math.min(Math.abs(window.scrollY - lastScrollY) / 600, 0.12);
      strengthTarget = Math.min(0.22 + delta, 0.35);
      lastScrollY = window.scrollY;
    };

    const handleMediaChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) {
        stop();
        strengthTarget = 0.08;
        setStrength(strengthTarget);
      } else {
        strengthTarget = 0.22;
        start();
      }
    };

    const handlePulseEnter = () => {
      if (reduced) return;
      strengthTarget = 0.32;
    };

    const handlePulseLeave = () => {
      if (reduced) return;
      strengthTarget = 0.24;
    };

    const registerPulseTargets = () => {
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-laser-pulse]"),
      );
      targets.forEach((el) => {
        el.addEventListener("pointerenter", handlePulseEnter);
        el.addEventListener("pointerleave", handlePulseLeave);
        el.addEventListener("pointercancel", handlePulseLeave);
      });
      return () => {
        targets.forEach((el) => {
          el.removeEventListener("pointerenter", handlePulseEnter);
          el.removeEventListener("pointerleave", handlePulseLeave);
          el.removeEventListener("pointercancel", handlePulseLeave);
        });
      };
    };

    unregisterPulseTargets = registerPulseTargets();

    const observer = new MutationObserver(() => {
      unregisterPulseTargets();
      unregisterPulseTargets = registerPulseTargets();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setStrength(reduced ? 0.1 : strengthTarget);
    if (!reduced) {
      node.style.animationPlayState = "running";
      frame = window.requestAnimationFrame(animate);
    } else {
      node.style.animationPlayState = "paused";
    }

    document.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    media.addEventListener("change", handleMediaChange);

    return () => {
      stop();
      unregisterPulseTargets();
      observer.disconnect();
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      media.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "laser-grid pointer-events-none select-none [--laser-strength:0.22]",
        className,
      )}
    />
  );
}
