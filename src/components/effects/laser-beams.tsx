"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface BeamSeed {
  id: number;
  angle: number;
  delay: number;
  speed: number;
  spread: number;
}

const BEAM_COUNT = 5;

export function LaserBeams({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seeds = useMemo<BeamSeed[]>(
    () =>
      Array.from({ length: BEAM_COUNT }, (_, id) => ({
        id,
        angle: 35 + Math.random() * 25 * (Math.random() > 0.5 ? 1 : -1),
        delay: Math.random() * -6,
        speed: 18 + Math.random() * 12,
        spread: 12 + Math.random() * 18,
      })),
    [],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window === "undefined") return;

    const beams = Array.from(node.querySelectorAll<HTMLElement>("[data-beam]"));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = (reduced: boolean) => {
      beams.forEach((beam) => {
        beam.style.animationPlayState = reduced ? "paused" : "running";
        beam.style.opacity = reduced ? "0.18" : "";
      });
    };

    apply(media.matches);
    const handleChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [seeds]);

  return (
    <div ref={containerRef} aria-hidden="true" className={cn("laser-beams", className)}>
      {seeds.map((seed) => (
        <span
          key={seed.id}
          data-beam
          className="laser-beams__beam"
          style={
            {
              ["--beam-angle" as const]: `${seed.angle}deg`,
              ["--beam-delay" as const]: `${seed.delay}s`,
              ["--beam-speed" as const]: `${seed.speed}s`,
              ["--beam-spread" as const]: `${seed.spread}`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
