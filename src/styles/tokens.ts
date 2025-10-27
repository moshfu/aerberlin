export const colors = {
  background: "#000000",
  surface: "#050505",
  elevated: "#0C0C0C",
  border: "#1E1E1E",
  foreground: "#F5F5F5",
  muted: "#9B9B9B",
  mutedSoft: "rgba(245, 245, 245, 0.14)",
  accent: "#FF102A",
  accentSoft: "rgba(255, 16, 42, 0.2)",
  highlight: "rgba(255, 16, 42, 0.08)",
  success: "#63D471",
  warning: "#F2C94C",
  danger: "#FF102A",
};

export const typography = {
  display: {
    family: "var(--font-display)",
    weights: {
      regular: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacings: {
      tight: "-0.04em",
      wide: "0.24em",
    },
  },
  body: {
    family: "var(--font-body)",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    lineHeights: {
      tight: 1.3,
      relaxed: 1.6,
    },
  },
};

export const spacing = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1.25rem",
  lg: "2.5rem",
  xl: "3.5rem",
  "2xl": "5rem",
};

export const radii = {
  sm: "2px",
  md: "4px",
  lg: "6px",
  pill: "999px",
};

export const shadows = {
  subtle: "0 16px 32px rgba(0, 0, 0, 0.35)",
  ambient: "0 24px 48px rgba(0, 0, 0, 0.45)",
  glow: "0 0 0 1px rgba(255, 16, 42, 0.35)",
};

export const motion = {
  duration: {
    hover: "140ms",
    enter: "220ms",
  },
  easing: {
    easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
};
