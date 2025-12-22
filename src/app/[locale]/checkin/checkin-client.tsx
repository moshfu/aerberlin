"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2Icon, ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Scanner = dynamic(async () => (await import("@yudiel/react-qr-scanner")).Scanner, {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.92)]">
      <Loader2Icon className="h-6 w-6 animate-spin" />
    </div>
  ),
});

type CheckStatus = "idle" | "loading" | "valid" | "invalid" | "error";

type TicketResponse = {
  status: CheckStatus;
  attendee?: string;
  event?: string;
  message?: string;
};

interface CheckInClientProps {
  events: Array<{ title: string; slug: string; pretixEventId: string }>;
}

export function CheckInClient({ events }: CheckInClientProps) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<CheckStatus>("idle");
  const [result, setResult] = useState<TicketResponse | null>(null);
  const [scanEnabled, setScanEnabled] = useState(true);
  const [eventSlug, setEventSlug] = useState(events[0]?.slug ?? "");

  const statusBadge = useMemo(() => {
    if (state === "valid") return <Badge variant="success">Validated</Badge>;
    if (state === "invalid") return <Badge variant="danger">Invalid</Badge>;
    if (state === "error") return <Badge variant="danger">Error</Badge>;
    return <Badge variant="outline">Awaiting scan</Badge>;
  }, [state]);

  if (!events.length) {
    return (
      <Card className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.92)] p-12 text-center text-muted">
        Link a Pretix event ID in Sanity to enable check-in scanning.
      </Card>
    );
  }

  function extractSecret(raw: string) {
    if (!raw) return "";
    const cleaned = raw.trim();
    const tryUrl = (value: string) => {
      try {
        const url = new URL(value);
        const params = url.searchParams;
        const fromParams =
          params.get("secret") ||
          params.get("token") ||
          params.get("code") ||
          params.get("c");
        const pathParts = url.pathname.split("/").filter(Boolean);
        return fromParams || pathParts[pathParts.length - 1] || "";
      } catch {
        return "";
      }
    };
    const fromUrl = tryUrl(cleaned);
    if (fromUrl) return fromUrl;
    const firstToken = cleaned.split(/\s+/)[0];
    if (firstToken && firstToken !== cleaned) {
      const retryUrl = tryUrl(firstToken);
      if (retryUrl) return retryUrl;
      return firstToken;
    }
    return cleaned;
  }

  async function handleCode(scanned: string) {
    if (!scanned || state === "loading" || !eventSlug) return;
    const secret = extractSecret(scanned);
    setCode(secret);
    setState("loading");
    try {
      setScanEnabled(false);
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: secret, eventSlug }),
      });
      const data: TicketResponse = await response.json();
      if (response.ok) {
        setState(data.status);
        setResult(data);
      } else {
        setState("error");
        setResult({ status: "error", message: data.message ?? "Unknown error" });
      }
    } catch (error) {
      console.error(error);
      setState("error");
      setResult({ status: "error", message: "Network error" });
    } finally {
      // Allow new scans after processing completes.
      setScanEnabled(true);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
      <div className="space-y-4">
        <Select value={eventSlug} onValueChange={(value) => setEventSlug(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.slug} value={event.slug}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.92)]">
          <Scanner
            constraints={{ facingMode: "environment" }}
            paused={!scanEnabled || state === "loading" || !eventSlug}
            onScan={(codes) => {
              const first = codes?.[0]?.rawValue;
              if (first) {
                setScanEnabled(false);
                handleCode(first);
              }
            }}
            onError={(error) => console.error(error)}
            classNames={{ container: "rounded-[var(--radius-lg)]" }}
            styles={{ container: { width: "100%", borderRadius: "12px", overflow: "hidden" } }}
          >
            <div className="pointer-events-none absolute inset-0 border-4 border-accent/60" />
          </Scanner>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (code) {
              handleCode(code);
            }
          }}
          className="flex gap-3"
        >
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Scan or paste ticket code"
            disabled={!eventSlug}
          />
          <Button type="submit" variant="primary" disabled={state === "loading" || !eventSlug}>
            Validate
          </Button>
        </form>
      </div>
      <Card className="flex h-fit flex-col gap-4 border border-[rgba(255,255,255,0.12)] bg-[rgba(12,12,12,0.92)] p-6">
        <div className="flex items-center justify-between">
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted">Ticket status</p>
          {statusBadge}
        </div>
        {state === "loading" ? (
          <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            Checking Pretix…
          </div>
        ) : result ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,18,18,0.95)] px-4 py-3">
              {state === "valid" ? (
                <ShieldCheckIcon className="h-5 w-5 text-accent" />
              ) : (
                <ShieldXIcon className="h-5 w-5 text-danger" />
              )}
              <div className="text-sm">
                <p className="font-medium uppercase tracking-[0.18em] text-foreground">
                  {result.attendee ?? "Unknown attendee"}
                </p>
                <p className="text-xs text-muted">{result.event}</p>
              </div>
            </div>
            <p className="text-sm text-muted">{result.message}</p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Select the active event, then aim the camera at the QR code or paste the ticket hash to validate entry.
          </p>
        )}
        <div className="mt-auto flex gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              setState("idle");
              setCode("");
              setScanEnabled(true);
            }}
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            onClick={() => setScanEnabled((prev) => !prev)}
            disabled={state === "loading"}
          >
            {scanEnabled ? "Pause camera" : "Resume camera"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
