"use client";

import { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StaggerProps extends PropsWithChildren {
  className?: string;
  viewportOnce?: boolean;
  delayChildren?: number;
}

export function StaggerGroup({
  children,
  className,
  viewportOnce = false,
  delayChildren,
}: StaggerProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce ? { once: true, amount: 0.2 } : undefined}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface FadeProps extends PropsWithChildren {
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { delay } },
      }}
    >
      {children}
    </motion.div>
  );
}
