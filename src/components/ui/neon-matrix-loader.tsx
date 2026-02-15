'use client'

import React from "react";

export function NeonMatrixLoader() {
  const delays = [0, 1, 2, 1, 2, 3, 2, 3, 4];
  return (
    <div className="neon-loader flex flex-col items-center justify-center gap-6 p-6">
      <div className="relative h-10 w-10">
        <div className="grid h-full w-full grid-cols-3 gap-2">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className={`square-item relative delay-${delays[index] ?? 0}`}
            >
              <div className="h-full w-full rounded-md bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 shadow-lg shadow-red-500/40" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-red-500/25 blur-xl animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-200 animate-pulse">
          Generating tickets…
        </p>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full bg-red-400 animate-[neonBounce_2s_ease-in-out_infinite] dot-delay-${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
