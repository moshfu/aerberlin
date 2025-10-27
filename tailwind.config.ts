import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import { colors, radii, shadows, spacing, motion } from "./src/styles/tokens";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        background: colors.background,
        surface: colors.surface,
        elevated: colors.elevated,
        foreground: colors.foreground,
        muted: {
          DEFAULT: colors.muted,
          soft: colors.mutedSoft,
          foreground: colors.muted,
        },
        accent: {
          DEFAULT: colors.accent,
          soft: colors.accentSoft,
          foreground: colors.background,
        },
        border: colors.border,
        input: colors.border,
        ring: colors.accent,
        highlight: colors.highlight,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        display: "-0.02em",
        wide: "0.18em",
      },
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        "2xl": spacing["2xl"],
      },
      boxShadow: {
        subtle: shadows.subtle,
        ambient: shadows.ambient,
        glow: shadows.glow,
      },
      borderRadius: {
        lg: radii.lg,
        md: radii.md,
        sm: radii.sm,
        pill: radii.pill,
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(12px) scale(0.98)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": `fade-in ${motion.duration.enter} ${motion.easing.spring} forwards`,
        "fade-up": `fade-up ${motion.duration.enter} ${motion.easing.spring} forwards`,
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
};

export default config;
