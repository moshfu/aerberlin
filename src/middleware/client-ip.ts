import type { NextRequest } from "next/server";

type RequestLike = Pick<NextRequest, "headers"> & { ip?: string | null };

export function getClientIp(request: RequestLike): string | null {
  if (request.ip) {
    return request.ip;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    const trimmed = realIp.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}
