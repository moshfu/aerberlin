"use client";

import { useMemo, useState } from "react";
import { Loader2Icon, MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { TicketTierCard } from "@/components/cards/ticket-tier-card";
import { Button } from "@/components/ui/button";
import type { TicketCatalog, TicketTier } from "@/types/ticket";
import { cn } from "@/lib/utils";

interface TicketShopProps {
  catalog: TicketCatalog | null;
  locale: string;
  checkoutLabel: string;
  emptyLabel: string;
  totalLabel: string;
  successRedirectLabel: string;
  checkoutEnabled: boolean;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

export function TicketShop({
  catalog,
  locale,
  checkoutLabel,
  emptyLabel,
  totalLabel,
  successRedirectLabel,
  checkoutEnabled,
}: TicketShopProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleAdd(tier: TicketTier) {
    if (!checkoutEnabled) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === tier.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === tier.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: tier.productId,
          name: tier.name,
          price: tier.price,
          currency: tier.currency,
          quantity: 1,
        },
      ];
    });
  }

  function handleRemove(productId: number) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleDecrease(productId: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleIncrease(productId: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  async function handleCheckout() {
    if (!checkoutEnabled) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          eventSlug: catalog?.pretixEventSlug,
          locale,
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(successRedirectLabel);
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!catalog) {
    return (
      <div className="aer-panel text-center text-[0.78rem] uppercase tracking-[0.24em] text-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="aer-grid aer-ticket-shop">
      <div className="aer-grid">
        {catalog.products.map((tier) => (
          <TicketTierCard
            key={tier.productId}
            tier={tier}
            locale={locale}
            onAdd={handleAdd}
            disabled={!checkoutEnabled}
          />
        ))}
      </div>
      <div className="aer-panel aer-cart">
        <div className="aer-cart__header">
          <span className="aer-cart__label">Cart</span>
          <span className="aer-cart__count">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        <div className="aer-cart__list">
          {cart.length ? (
            cart.map((item) => (
              <div key={item.productId} className="aer-cart__row">
                <div>
                  <p className="aer-cart__title">{item.name}</p>
                  <p className="aer-cart__price">
                    {new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: item.currency,
                    }).format(item.price)}
                  </p>
                </div>
                <div className="aer-cart__controls">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDecrease(item.productId)}
                    className="aer-cart__icon"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <span className="aer-cart__quantity">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleIncrease(item.productId)}
                    className="aer-cart__icon"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.productId)}
                    className="aer-cart__icon"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="aer-cart__empty">{emptyLabel}</p>
          )}
        </div>
        <div className="aer-cart__total">
          <span>{totalLabel}</span>
          <span>
            {new Intl.NumberFormat(locale, {
              style: "currency",
              currency: catalog.products[0]?.currency ?? "EUR",
            }).format(total)}
          </span>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={!cart.length || isLoading || !checkoutEnabled}
          variant="primary"
          className={cn("aer-cart__checkout", isLoading && "opacity-80")}
        >
          {checkoutEnabled ? (
            isLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : checkoutLabel
          ) : (
            "Checkout disabled in demo"
          )}
        </Button>
        <p className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
          By proceeding you agree to our house guidelines and
          <Link href="/terms" className="ml-1 text-accent underline underline-offset-4">
            terms and conditions
          </Link>
          .
        </p>
        {!checkoutEnabled ? (
          <p className="aer-cart__hint">Connect Pretix and Stripe credentials to enable live checkout.</p>
        ) : null}
      </div>
    </div>
  );
}
