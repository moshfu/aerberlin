const FALLBACK_SITE_URL = "https://aerberlin.de";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getSiteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const raw = env?.trim() || FALLBACK_SITE_URL;
  return normalizeBaseUrl(raw);
}

export function buildCanonical(path = "/") {
  const base = `${getSiteUrl()}/`;
  return new URL(path, base).toString();
}
