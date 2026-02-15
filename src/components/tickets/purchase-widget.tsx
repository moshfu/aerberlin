"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type BffItem = {
  id: number;
  name: Record<string, string> | string;
  default_price: string;
  admission: boolean;
  availability: string | null;
  variations?: Array<{ id: number; value: string; price: string; availability?: string | null }>;
};

type BffOrderResponse = {
  order_code: string;
  order_status: string;
  payment_url?: string;
};

const toDisplayName = (name: BffItem["name"]) => {
  if (typeof name === "string") return name;
  return (
    name.en ??
    name.de ??
    Object.values(name)[0] ??
    "Ticket"
  );
};

const formatPrice = (price: string) => {
  const value = Number(price);
  if (Number.isNaN(value)) return price;
  return `${value.toFixed(2)} €`;
};

const getCookie = (name: string): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

const isPurchasableAvailability = (value: string | null | undefined): boolean => {
  if (!value) return true;
  return value.toLowerCase() === "ok";
};

export function PurchaseWidget({ pretixEventId }: { pretixEventId: string }) {
  const [items, setItems] = useState<BffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [voucher, setVoucher] = useState("");
  const [attendeeNames, setAttendeeNames] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "checking" | "valid" | "invalid">(
    "idle",
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/tickets/events/${pretixEventId}/items`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Items request failed (${res.status})`);
        }
        const data: BffItem[] = await res.json();
        if (!mounted) return;
        setItems(data);
        const firstAvailable =
          data.find((i) => (i.availability ?? "ok") === "ok") ?? data[0] ?? null;
        setSelectedItem(firstAvailable?.id ?? null);
      } catch {
        if (!mounted) return;
        setError("Could not load tickets. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [pretixEventId, reloadKey]);

  const availabilityLabel = (value: string | null | undefined) => {
    if (!value || value === "ok") return null;
    const v = value.toLowerCase();
    if (v.includes("not_open")) return null;
    if (v.includes("sold")) return "Sold out";
    if (v.includes("voucher")) return "Requires voucher";
    if (v.includes("not") && v.includes("start")) return "Not yet available";
    if (v.includes("ended")) return "Sale ended";
    if (v.includes("unavail")) return "Unavailable";
    if (v.includes("pause")) return "Temporarily unavailable";
    return "Unavailable";
  };

  useEffect(() => {
    const fullName = `${customerFirstName.trim()} ${customerLastName.trim()}`.trim();
    setAttendeeNames((prev) => {
      const next = [...prev];
      if (!next[0] || next[0].trim().length <= 1) {
        next[0] = fullName || next[0];
      }
      return next;
    });
  }, [customerFirstName, customerLastName]);

  useEffect(() => {
    const fullName = `${customerFirstName.trim()} ${customerLastName.trim()}`.trim();
    if (!fullName || quantity < 1) return;
    setAttendeeNames((prev) => {
      const next = [...prev];
      next[0] = fullName;
      while (next.length < quantity) next.push("");
      return next.slice(0, quantity);
    });
  }, [quantity, customerFirstName, customerLastName]);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedItem) {
      setError("Select a ticket.");
      return;
    }

    const chosen = items.find((i) => i.id === selectedItem);
    const statusLabel = availabilityLabel(chosen?.availability);
    if (!isPurchasableAvailability(chosen?.availability)) {
      setError(statusLabel ?? "Ticket unavailable right now.");
      return;
    }
    if (!customerFirstName || !customerLastName || !customerEmail) {
      setError("Enter full name and email.");
      return;
    }
    const fullName = `${customerFirstName.trim()} ${customerLastName.trim()}`.trim();
    if (quantity <= 0) {
      setError("Select at least one ticket.");
      return;
    }
    const neededNames = Math.max(1, quantity);
    const namesFilled = attendeeNames.slice(0, neededNames).every((n) => n.trim().length > 1);
    if (!namesFilled) {
      setError("Add a name for each ticket holder.");
      return;
    }
    if (!termsAccepted) {
      setShowTermsError(true);
      setError("Please accept the terms to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const names = Array.from({ length: neededNames }).map(
        (_, idx) => attendeeNames[idx]?.trim() || fullName,
      );
      const body = {
        idempotency_key: `aer-${selectedItem}-${Date.now()}`,
        positions: [{ item_id: selectedItem, qty: quantity, attendee_names: names }],
        customer: { name: fullName, email: customerEmail },
        ...(voucher.trim() ? { voucher_code: voucher.trim() } : {}),
      };
      const res = await fetch(`/api/tickets/events/${pretixEventId}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCookie("aer_csrf"),
        },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (res.status === 409) {
        const details = await res.json().catch(() => ({}));
        const reason =
          details?.error === "not_enough_left"
            ? "Not enough tickets left."
            : "Ticket unavailable right now.";
        setError(reason);
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Order failed (${res.status}): ${text}`);
      }
      const data: BffOrderResponse = await res.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError("No payment URL returned. Please try again.");
      }
      } catch {
        setError("Could not start checkout. Please try again.");
      } finally {
        setSubmitting(false);
      }
  };

  const onQuantityChange = (value: number) => {
    const clean = Number.isNaN(value) ? 1 : Math.max(1, Math.min(10, value));
    setQuantity(clean);
    setAttendeeNames((prev) => {
      const next = [...prev];
      while (next.length < clean) next.push("");
      return next.slice(0, clean);
    });
  };

  const checkVoucher = async () => {
    if (!voucher.trim()) return;
    setVoucherStatus("checking");
    try {
      const res = await fetch(`/api/tickets/events/${pretixEventId}/vouchers/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCookie("aer_csrf"),
        },
        body: JSON.stringify({ voucher_code: voucher.trim() }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.valid && Array.isArray(data.items)) {
        setItems(data.items);
        const firstOk =
          data.items.find((i: BffItem) => (i.availability ?? "ok") === "ok") ??
          data.items[0] ??
          null;
        setSelectedItem(firstOk?.id ?? null);
        setVoucherStatus("valid");
      } else {
        setVoucherStatus("invalid");
      }
    } catch {
      setVoucherStatus("invalid");
    }
  };

  const selectedPrice = useMemo(() => {
    const item = items.find((i) => i.id === selectedItem);
    if (!item) return null;
    const value = Number(item.default_price);
    if (Number.isNaN(value)) return null;
    return value;
  }, [items, selectedItem]);

  const totalLabel =
    selectedPrice != null ? `${(selectedPrice * quantity).toFixed(2)} € total` : null;

  if (loading) {
    return (
      <div className="aer-panel text-sm uppercase tracking-[0.2em] text-[rgba(255,255,255,0.65)]">
        Loading tickets…
      </div>
    );
  }

  if (error) {
    return (
      <div className="aer-panel space-y-2 text-sm">
        <div className="uppercase tracking-[0.2em] text-red-300">{error}</div>
        <button
          type="button"
          className="aer-nav-button aer-nav-button--compact"
          onClick={() => {
            setLoading(true);
            setError(null);
            setItems([]);
            setReloadKey((v) => v + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="aer-panel text-sm uppercase tracking-[0.2em] text-[rgba(255,255,255,0.65)]">
        No tickets available right now.
      </div>
    );
  }

  return (
    <div className="aer-panel space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const label = toDisplayName(item.name);
          const price = formatPrice(item.default_price);
          const statusLabel = availabilityLabel(item.availability);
          const disabled = !isPurchasableAvailability(item.availability);
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedItem(item.id)}
              className={cn(
                "aer-nav-button justify-between text-left",
                selectedItem === item.id && "is-active",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <span className="flex flex-col">
                <span className="uppercase tracking-[0.18em]">{label}</span>
                <span className="text-[0.78rem] text-[rgba(255,255,255,0.75)]">
                  {price}
                </span>
              </span>
              {statusLabel ? (
                <span className="text-[0.72rem] uppercase tracking-[0.18em] text-red-200">
                  {statusLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
          First name
          <input
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            className="aer-input"
            autoComplete="given-name"
          />
        </label>
        <label className="flex flex-col gap-1 text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
          Last name
          <input
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            className="aer-input"
            autoComplete="family-name"
          />
        </label>
        <label className="flex flex-col gap-1 text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
          Email
          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="aer-input"
            placeholder="you@example.com"
            autoComplete="email"
            type="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
          Quantity
          <select
            value={quantity}
            onChange={(e) => onQuantityChange(Number.parseInt(e.target.value, 10))}
            className="aer-input bg-[rgba(0,0,0,0.35)]"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="w-full md:w-1/2">
        <label className="flex flex-col gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.5)]">
          Voucher (optional)
          <div className="flex gap-2">
            <input
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              className="aer-input flex-1 border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[0.85rem]"
              placeholder="Enter code"
            />
            <button
              type="button"
              onClick={checkVoucher}
              className="aer-nav-button aer-nav-button--compact"
              disabled={!voucher.trim() || voucherStatus === 'checking'}
            >
              {voucherStatus === "checking" ? "Checking…" : "Check"}
            </button>
          </div>
          {voucherStatus === "valid" ? (
            <span className="text-[0.65rem] uppercase tracking-[0.16em] text-green-300">
              Voucher applied.
            </span>
          ) : null}
          {voucherStatus === "invalid" ? (
            <span className="text-[0.65rem] uppercase tracking-[0.16em] text-red-300">
              Invalid voucher.
            </span>
          ) : null}
        </label>
      </div>

      {quantity > 1 ? (
        <div className="space-y-3">
          <div className="text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
            Ticket holder names
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {Array.from({ length: quantity }).map((_, idx) => (
              <input
                key={idx}
                value={attendeeNames[idx] ?? ""}
                onChange={(e) => {
                  const next = [...attendeeNames];
                  next[idx] = e.target.value;
                  setAttendeeNames(next);
                }}
                className="aer-input placeholder:uppercase placeholder:tracking-[0.14em] placeholder:text-[rgba(255,255,255,0.5)] placeholder:text-[0.75rem]"
                placeholder={`Ticket ${idx + 1} — Full Name`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <label className="flex items-center gap-3 text-[0.7rem] tracking-[0.08em] text-[rgba(255,255,255,0.5)]">
        <input
          type="checkbox"
          className="h-4 w-4 accent-accent"
          checked={termsAccepted}
          onChange={(e) => {
            setTermsAccepted(e.target.checked);
            if (e.target.checked) setShowTermsError(false);
          }}
        />
        <span className="leading-snug">
          I confirm I have read and agree to the{" "}
          <a
            href="/terms"
            className="underline decoration-dotted underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Terms and Conditions
          </a>
          .
        </span>
      </label>
      {!termsAccepted && showTermsError ? (
        <div className="text-[0.68rem] uppercase tracking-[0.18em] text-red-300">
          Please agree to the terms to continue.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !termsAccepted}
          className="aer-nav-button aer-nav-button--compact"
        >
          {submitting ? "Redirecting…" : "Buy securely"}
        </button>
        {totalLabel ? (
          <span className="text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
            {totalLabel}
          </span>
        ) : null}
      </div>
      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.45)]">
        You will be redirected to Pretix to complete payment.
      </div>
    </div>
  );
}
