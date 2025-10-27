import { CheckIcon, MinusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TicketTier } from "@/types/ticket";
import { cn } from "@/lib/utils";

interface TicketTierCardProps {
  tier: TicketTier;
  locale: string;
  onAdd?: (tier: TicketTier) => void;
  disabled?: boolean;
}

export function TicketTierCard({ tier, locale, onAdd, disabled }: TicketTierCardProps) {
  const lowStock = typeof tier.available === "number" && tier.available > 0 && tier.available <= 10;
  const soldOut = typeof tier.available === "number" && tier.available <= 0;

  const isDisabled = Boolean(disabled) || soldOut;

  return (
    <div className="aer-panel aer-ticket">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="aer-panel__heading text-[1.8rem]">
            {tier.name}
          </h3>
          {tier.description ? (
            <p className="aer-panel__content text-xs uppercase tracking-[0.26em] text-[rgba(255,255,255,0.58)]">
              {tier.description}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "aer-ticket__status",
            soldOut && "aer-ticket__status--danger",
            !soldOut && lowStock && "aer-ticket__status--warning",
            !soldOut && !lowStock && "aer-ticket__status--ok",
          )}
        >
          {soldOut ? "Sold out" : lowStock ? "Low stock" : "Available"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="aer-ticket__price">
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency: tier.currency,
          }).format(tier.price)}
        </p>
        <div className="aer-ticket__meta">
          <CheckIcon className="h-4 w-4" /> SEPA
          <MinusIcon className="h-4 w-4" /> Card
        </div>
      </div>
      <Button
        disabled={isDisabled}
        onClick={onAdd && !isDisabled ? () => onAdd(tier) : undefined}
        variant={soldOut ? "outline" : "primary"}
        className={cn("aer-ticket__cta justify-between px-5", soldOut && "text-[rgba(255,255,255,0.35)]")}
      >
        <span>{soldOut ? "Sold out" : disabled ? "Unavailable" : "Add to cart"}</span>
        {!soldOut && <span className="text-[0.68rem] uppercase tracking-[0.18em]">→</span>}
      </Button>
    </div>
  );
}
