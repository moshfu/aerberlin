'use client';

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COOKIE_CONSENT_COOKIE, type CookieConsentValue } from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";

const CONSENT_EVENT = "cookie-preferences:open";
const STORAGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

function getStoredConsent(): CookieConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return value === "essential" || value === "analytics" ? value : null;
}

function persistConsent(value: CookieConsentValue) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE}=${value}; Max-Age=${STORAGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function CookieBanner({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getStoredConsent()) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const handleChoice = useCallback((value: CookieConsentValue, reloadAfterAccept?: boolean) => {
    persistConsent(value);
    setVisible(false);
    if (reloadAfterAccept) {
      window.location.reload();
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] border border-[rgba(255,16,42,0.45)] bg-[rgba(12,12,12,0.95)] px-6 py-6 text-left shadow-[0_18px_38px_rgba(0,0,0,0.6)]",
        "outline outline-1 outline-[rgba(255,16,42,0.35)]",
        className,
      )}
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-modal="true"
    >
      <div className="space-y-4 text-[0.76rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.75)]">
        <p id="cookie-banner-title" className="text-[0.7rem] font-semibold text-foreground">
          Cookie preferences
        </p>
        <p>
          Essential cookies keep this site operational. Enable analytics if you want pseudonymous metrics. Your call,
          always reversible.
        </p>
        <p>
          See the full policy in our{" "}
          <Link href="/privacy" className="text-accent underline underline-offset-4">
            privacy section
          </Link>
          .
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="primary"
          className="min-w-[8rem] border-accent/60"
          onClick={() => handleChoice("analytics", true)}
          aria-label="Accept all cookies"
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="min-w-[8rem] border-[rgba(255,255,255,0.22)] text-[rgba(255,255,255,0.75)]"
          onClick={() => handleChoice("essential")}
          aria-label="Use essential cookies only"
        >
          Essential
        </Button>
      </div>
    </div>
  );
}

export function CookiePreferencesTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const handleClick = useCallback(() => {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "text-[0.6rem] uppercase tracking-[0.28em] text-muted transition hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
