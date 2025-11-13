type RateLimitOptions = {
  windowMs?: number;
  limit?: number;
  keyPrefix?: string;
};

type RateLimitEntry = {
  hits: number;
  reset: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 10;
const tokenCache = new Map<string, RateLimitEntry>();

export function rateLimit(request: Request, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const keyPrefix = options.keyPrefix ?? "global";
  const now = Date.now();
  const identifier = `${keyPrefix}:${getClientIp(request)}`;
  const entry = tokenCache.get(identifier);

  if (!entry || entry.reset <= now) {
    const reset = now + windowMs;
    tokenCache.set(identifier, { hits: 1, reset });
    return { success: true, limit, remaining: limit - 1, reset };
  }

  if (entry.hits >= limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.reset - now) / 1000));
    return { success: false, limit, remaining: 0, reset: entry.reset, retryAfter };
  }

  entry.hits += 1;
  tokenCache.set(identifier, entry);
  return { success: true, limit, remaining: Math.max(0, limit - entry.hits), reset: entry.reset };
}

function getClientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const [first] = xff.split(",").map((part) => part.trim()).filter(Boolean);
    if (first) {
      return first;
    }
  }
  const xfRealIp = request.headers.get("x-real-ip");
  if (xfRealIp) {
    return xfRealIp;
  }
  return "127.0.0.1";
}
