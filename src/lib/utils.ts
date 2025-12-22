import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { buildCanonical } from "@/lib/seo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return buildCanonical(path);
}

export function formatCurrency(value: number | null | undefined, locale = "en", currency = "EUR") {
  if (value == null) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions) {
  const dt = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Europe/Berlin",
    ...options,
  }).format(dt);
}
