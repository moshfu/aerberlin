import { describe, expect, it } from "vitest";
import { getClientIp } from "@/middleware/client-ip";

const createRequest = (init: { ip?: string | null; headers?: Record<string, string> }) => {
  const headers = new Headers();
  Object.entries(init.headers ?? {}).forEach(([key, value]) => headers.set(key, value));
  return { ip: init.ip ?? null, headers };
};

describe("getClientIp", () => {
  it("prefers request.ip when provided", () => {
    const request = createRequest({ ip: "203.0.113.5" });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to the last X-Forwarded-For hop", () => {
    const request = createRequest({
      headers: { "x-forwarded-for": "198.51.100.10, 203.0.113.1 , 192.0.2.2" },
    });
    expect(getClientIp(request)).toBe("192.0.2.2");
  });

  it("uses X-Real-IP when no forwarded header is present", () => {
    const request = createRequest({
      headers: { "x-real-ip": "198.51.100.99" },
    });
    expect(getClientIp(request)).toBe("198.51.100.99");
  });

  it("returns null when no headers are available", () => {
    const request = createRequest({});
    expect(getClientIp(request)).toBeNull();
  });
});
