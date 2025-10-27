"use client";

import { useTransition } from "react";
import { siteConfig } from "@/config/site";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const path = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (siteConfig.locales.length <= 1) {
    return null;
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {siteConfig.locales.map((locale) => {
        const active = path?.startsWith(`/${locale}`);
        return (
          <Button
            key={locale}
            variant={active ? "secondary" : "ghost"}
            size="xs"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                router.replace(path ?? "/", { locale });
              })
            }
            className={cn(
              "min-w-[2.4rem] px-3 text-[0.62rem] tracking-[0.16em]",
              active
                ? "border-[rgba(255,16,42,0.45)] bg-[rgba(255,16,42,0.18)]"
                : "border-[rgba(245,245,245,0.16)] text-muted hover:text-foreground",
            )}
          >
            {locale.toUpperCase()}
          </Button>
        );
      })}
    </div>
  );
}
