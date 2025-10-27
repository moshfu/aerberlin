"use client";

import { useEffect, useMemo, useRef } from "react";

interface StickerSeed {
  id: number;
  left: number;
  top: number;
  depth: number;
  size: number;
  type: "cloud" | "horse";
}

const STICKER_COUNT = 7;

export function FloatingStickers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const seeds = useMemo<StickerSeed[]>(
    () =>
      Array.from({ length: STICKER_COUNT }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        top: Math.random() * 100,
        depth: 0.3 + Math.random() * 0.3,
        size: 48 + Math.random() * 32,
        type: Math.random() > 0.5 ? "cloud" : "horse",
      })),
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;
    const nodes = Array.from(container.querySelectorAll<HTMLDivElement>("[data-sticker]")).map(
      (node, index) => ({ node, seed: seeds[index] }),
    );

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReduced = media.matches;
    let raf: number | null = null;

    const update = () => {
      const scrollY = window.scrollY;
      nodes.forEach(({ node, seed }) => {
        const offset = prefersReduced ? 0 : scrollY * seed.depth * 0.06;
        node.style.setProperty("--sticker-parallax", `${offset}px`);
      });
      raf = window.requestAnimationFrame(update);
    };

    if (!prefersReduced) {
      raf = window.requestAnimationFrame(update);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = null;
        }
      } else if (!prefersReduced && raf === null) {
        raf = window.requestAnimationFrame(update);
      }
    };

    const handleMediaChange = (event: MediaQueryListEvent) => {
      prefersReduced = event.matches;
      if (prefersReduced) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = null;
        }
        nodes.forEach(({ node }) => node.style.setProperty("--sticker-parallax", "0px"));
      } else if (!raf) {
        raf = window.requestAnimationFrame(update);
      }
    };

    media.addEventListener("change", handleMediaChange);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      media.removeEventListener("change", handleMediaChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [seeds]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="floating-stickers pointer-events-none hidden lg:block"
    >
      {seeds.map((seed) => (
        <div
          key={seed.id}
          data-sticker
          className={`floating-sticker floating-sticker--${seed.type}`}
          style={{
            left: `${seed.left}vw`,
            top: `${seed.top}vh`,
            width: `${seed.size}px`,
            height: `${seed.size}px`,
            ["--sticker-scale" as const]: (seed.depth + 0.7).toFixed(2),
          }}
        />
      ))}
    </div>
  );
}
