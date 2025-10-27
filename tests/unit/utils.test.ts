import { describe, expect, it } from "vitest";
import { absoluteUrl, formatCurrency, formatDateTime } from "@/lib/utils";

describe("utils", () => {
  it("formats currency", () => {
    expect(formatCurrency(12.5, "de", "EUR")).toBe("12,50 €");
  });

  it("builds absolute url", () => {
    expect(absoluteUrl("/events")).toBe("https://aer.berlin/events");
  });

  it("formats date/time in Berlin timezone", () => {
    const value = formatDateTime("2025-10-30T22:00:00.000Z", "en", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
    });
    expect(value).toMatch(/30/);
  });
});
