"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { NeonMatrixLoader } from "@/components/ui/neon-matrix-loader";

type OrderStatusResponse = {
  status: string;
  total?: string;
  downloads?: { pdf_url?: string; pkpass_url?: string };
};

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 90000;

export default function TicketSuccessPage() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const eventSlug = search.get("event") ?? "";
  const orderCode = search.get("code") ?? search.get("order") ?? "";
  const orderSecret = search.get("s") ?? search.get("secret") ?? "";
  const [status, setStatus] = useState<"pending" | "paid" | "timeout" | "error">("pending");
  const [message, setMessage] = useState("Checking your order…");
  const [downloads, setDownloads] = useState<{ pdf?: string; pkpass?: string }>({});
  const [countdown, setCountdown] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "waiting" | "ready" | "error">(
    "idle",
  );
  const startedAt = useMemo(() => Date.now(), []);

  const displayEventSlug = useMemo(() => {
    if (!eventSlug) return "";
    if (eventSlug.includes("-")) return eventSlug;
    const match = eventSlug.match(/^(aer)(\d+)/i);
    if (match) return `${match[1]}-${match[2]}`;
    return eventSlug;
  }, [eventSlug]);

  const redirectTarget = useMemo<`/events/${string}` | "/">(() => {
    if (displayEventSlug) return `/events/${displayEventSlug}`;
    return "/";
  }, [displayEventSlug]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!eventSlug || !orderCode || !orderSecret) {
      setStatus("error");
      setMessage("Missing secure order details in the URL.");
      return;
    }

    const poll = async () => {
      if (Date.now() - startedAt > TIMEOUT_MS) {
        setStatus("timeout");
        setMessage("We could not confirm payment in time. Please refresh or check your email.");
        setCountdown(5);
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 5000);
        return;
      }
      try {
        const res = await fetch(
          `/api/tickets/events/${eventSlug}/orders/${orderCode}?s=${encodeURIComponent(orderSecret)}`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: OrderStatusResponse = await res.json();
        const paid = data.status?.toLowerCase().startsWith("p");
        const dl = eventSlug && orderCode
          ? {
              pdf: `/api/tickets/events/${eventSlug}/orders/${orderCode}/downloads/pdf?s=${encodeURIComponent(orderSecret)}`,
              pkpass: `/api/tickets/events/${eventSlug}/orders/${orderCode}/downloads/passbook?s=${encodeURIComponent(orderSecret)}`,
            }
          : {};
        setDownloads(dl);
        if (paid) {
          setStatus("paid");
          setMessage("Thank you for your order. You can download your ticket below.");
          setCountdown(60);
          setTimeout(() => {
            window.location.href = redirectTarget;
          }, 60000);
          return;
        }
        // not paid yet; poll again
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    const t = setTimeout(poll, 200);
    return () => clearTimeout(t);
  }, [eventSlug, orderCode, orderSecret, redirectTarget, router, startedAt, pathname]);

  const manualDownload = async () => {
    const type = downloads.pdf ? "pdf" : downloads.pkpass ? "passbook" : null;
    if (!type) return;
    setDownloadStatus("waiting");
    const attempt = async (tries: number) => {
      try {
        const res = await fetch(
          `/api/tickets/events/${eventSlug}/orders/${orderCode}/downloads/${type}?probe=1&s=${encodeURIComponent(orderSecret)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.ready) {
            setDownloadStatus("ready");
            window.location.href =
              `/api/tickets/events/${eventSlug}/orders/${orderCode}/downloads/${type}` +
              `?s=${encodeURIComponent(orderSecret)}`;
            return;
          }
        }
        if (res.status === 202 && tries < 15) {
          setTimeout(() => attempt(tries + 1), 800);
          return;
        }
        setDownloadStatus("error");
      } catch {
        if (tries < 15) {
          setTimeout(() => attempt(tries + 1), 800);
          return;
        }
        setDownloadStatus("error");
      }
    };
    attempt(0);
  };

  const localeSegment = pathname?.split("/")[1] || "";
  const apiPrefix = localeSegment ? `/${localeSegment}/api` : "/api";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://aerberlin.de";
  const calendarLink = eventSlug
    ? `${origin}${apiPrefix}/events/${eventSlug}/ics${orderCode ? `?code=${orderCode}` : ""}`
    : null;

  useEffect(() => {
    if (downloadStatus === "ready" || downloadStatus === "error") {
      const t = setTimeout(() => setDownloadStatus("idle"), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [downloadStatus]);

  return (
    <SubpageFrame
      title="Ticket confirmation"
      marqueeText="// TICKETS //"
      actions={
        <div className="aer-chipset flex flex-wrap gap-3">
          <Link href="/tickets" className="aer-nav-button aer-nav-button--compact">
            Back to tickets
          </Link>
          {eventSlug ? (
            <Link
              href={`/events/${eventSlug}`}
              className="aer-nav-button aer-nav-button--compact"
            >
              Back to event
            </Link>
          ) : null}
        </div>
      }
    >
      <div className="aer-panel space-y-4">
        <div className="text-[0.78rem] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.78)]">
          Order: {orderCode || "unknown"} {eventSlug ? `· ${eventSlug}` : ""}
        </div>
        <h2 className="text-[1.5rem] font-semibold tracking-[0.08em]">
          {status === "paid" ? "Tickets ready" : status === "timeout" ? "Timed out" : "Hang tight"}
        </h2>
        <p className="text-sm text-[rgba(255,255,255,0.75)] uppercase tracking-[0.18em]">
          {message}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="aer-nav-button aer-nav-button--compact"
            onClick={manualDownload}
            disabled={!downloads.pdf && !downloads.pkpass}
          >
            {downloads.pkpass || downloads.pdf ? "Download ticket" : "Waiting for download…"}
          </button>
          {status === "paid" ? (
            <>
              {calendarLink ? (
                <a className="aer-nav-button aer-nav-button--compact" href={calendarLink}>
                  Add to calendar
                </a>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            className="aer-nav-button aer-nav-button--compact"
            onClick={() => {
              window.location.href = redirectTarget;
            }}
          >
            Go back
          </button>
        </div>
        {countdown > 0 ? (
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.55)]">
            Redirecting in {countdown}s…
          </p>
        ) : null}
        {downloadStatus !== "idle" ? (
          <div className="rounded-lg border border-red-500/60 bg-[rgba(180,20,40,0.12)] p-4">
            <NeonMatrixLoader />
            {downloadStatus === "error" ? (
              <p className="text-xs uppercase tracking-[0.18em] text-red-200 text-center pt-2">
                Still generating, please try again…
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </SubpageFrame>
  );
}
