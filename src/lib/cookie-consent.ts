export const COOKIE_CONSENT_COOKIE = "aer-cookie-consent";

export type CookieConsentValue = "essential" | "analytics";

export function parseCookieConsent(value: string | undefined | null): CookieConsentValue | null {
  if (value === "essential" || value === "analytics") {
    return value;
  }
  return null;
}
