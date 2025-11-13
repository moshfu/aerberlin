"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface SpinningMarkProps {
  size?: number;
  orbitScale?: number;
  offsetX?: number;
  className?: string;
  imageSrc?: string | null;
  imageAlt?: string;
}

const ORBIT_TILT_X = 71;
const ORBIT_TILT_Y = -3.5;
const ORBIT_DURATION_MS = 20_000;
const LETTER_VERTICAL_SCALE = 3.0;
const TEXT_SOURCE = "berlin";
const LETTER_FONT_SIZE = 36;
const LETTER_SPACING_EM = 1.8;
const LETTER_STROKE_WEIGHT = 1.2;

export function SpinningMark({
  size = 64,
  orbitScale = 1,
  offsetX = 0,
  className,
  imageSrc,
  imageAlt,
}: SpinningMarkProps) {
  const normalizedOrbitScale = Math.max(0.4, orbitScale);
  const orbitWidth = size * 1.35 * normalizedOrbitScale;
  const orbitHeight = size * 1.02 * normalizedOrbitScale;
  const orbitOffsetY = 0.22 * normalizedOrbitScale;
  const radiusX = orbitWidth / 2;
  const radiusY = orbitHeight / 2;
  const letterFontSize = LETTER_FONT_SIZE * normalizedOrbitScale;

  const approximateCircumference =
    Math.PI *
    (3 * (radiusX + radiusY) -
      Math.sqrt((3 * radiusX + radiusY) * (radiusX + 3 * radiusY)));
  const estimatedLetterAdvance =
    letterFontSize * (1 + LETTER_SPACING_EM * 2);
  const wordAdvance = estimatedLetterAdvance * TEXT_SOURCE.length;
  const repeats = Math.max(8, Math.ceil(approximateCircumference / wordAdvance));

  const characters = useMemo(
    () => TEXT_SOURCE.repeat(repeats).split(""),
    [repeats],
  );
  const letters = useMemo(
    () =>
      characters.map((char, index) => ({
        char,
        baseAngle: -((360 / characters.length) * index),
      })),
    [characters],
  );

  const letterRefs = useRef<Array<HTMLDivElement | null>>([]);

  const setLetterRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      letterRefs.current[index] = node;
    },
    [],
  );

  useEffect(() => {
    const nodes = letterRefs.current;
    if (!nodes.length) {
      return undefined;
    }

    let frame = 0;
    const centerX = orbitWidth / 2;
    const centerY = orbitHeight / 2 + orbitOffsetY;

    const animate = (timestamp: number) => {
      const rotationProgress = (timestamp % ORBIT_DURATION_MS) / ORBIT_DURATION_MS;
      const rotationDeg = rotationProgress * 360;

      for (let i = 0; i < letters.length; i += 1) {
        const node = nodes[i];
        if (!node) continue;

        const { baseAngle } = letters[i];
        const angle = baseAngle - rotationDeg;
        const rad = (angle * Math.PI) / 180;

        const x = radiusX * Math.cos(rad);
        const y = radiusY * Math.sin(rad);

        const normalized = ((angle % 360) + 360) % 360;
        const dataset = node.dataset as DOMStringMap & {
          rotation?: string;
        };
        const isFront = normalized < 180;

        const dx = -radiusX * Math.sin(rad);
        const dy = radiusY * Math.cos(rad);
        const textRotation = (Math.atan2(dy, dx) * 180) / Math.PI + 180;

        node.style.left = `${centerX + x}px`;
        node.style.top = `${centerY + y}px`;
        const previousRotation = dataset.rotation ? Number(dataset.rotation) : textRotation;
        let adjustedRotation = textRotation;
        const delta = adjustedRotation - previousRotation;
        if (!Number.isNaN(previousRotation)) {
          if (delta > 180) {
            adjustedRotation -= 360;
          } else if (delta < -180) {
            adjustedRotation += 360;
          }
        }
        dataset.rotation = adjustedRotation.toString();

        node.style.transform = `translate(-50%, -50%) rotate(${adjustedRotation}deg) scaleY(${LETTER_VERTICAL_SCALE})`;
        node.style.opacity = isFront ? "0.82" : "0.25";
        node.style.zIndex = isFront ? "60" : "10";
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [letters, orbitHeight, orbitOffsetY, orbitWidth, radiusX, radiusY]);

  const resolvedSrc = imageSrc ?? siteConfig.brand.logo;
  if (!resolvedSrc) {
    return null;
  }

  const altText = imageAlt ?? `${siteConfig.name} rotating mark`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      aria-hidden="true"
      style={{
        width: orbitWidth,
        height: orbitHeight,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ transform: `rotateX(${ORBIT_TILT_X}deg) rotateY(${ORBIT_TILT_Y}deg)` }}
        >
          {letters.map(({ char }, index) => (
            <div
              key={`${char}-${index}`}
              ref={setLetterRef(index)}
              className="spinning-mark__letter absolute left-0 top-0 select-none text-white will-change-transform"
              style={{
                transformOrigin: "center",
                fontSize: `${letterFontSize}px`,
                letterSpacing: `${LETTER_SPACING_EM}em`,
                WebkitTextStroke: `${LETTER_STROKE_WEIGHT}px rgba(255, 255, 255, 0.75)`,
                textShadow: "none",
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative z-40 inline-flex items-center justify-center"
        style={{
          transform: `translate(${offsetX}px, ${-45 * normalizedOrbitScale}px)`,
        }}
      >
        <Image
          src={resolvedSrc}
          alt={altText}
          width={size}
          height={size}
          className="pointer-events-none select-none object-cover"
          priority
        />
      </div>
    </div>
  );
}
