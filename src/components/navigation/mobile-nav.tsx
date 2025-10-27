"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "./locale-switcher";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface MobileNavProps {
  items: { key: string; label: string; href: string }[];
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden border border-[rgba(255,255,255,0.16)]"
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <div className="flex h-full flex-col gap-10 pt-12">
          <div className="space-y-2">
            <p className="font-display text-2xl uppercase tracking-tight">
              {siteConfig.name}
            </p>
            <p className="text-sm text-muted">{siteConfig.description}</p>
          </div>
          <nav className="flex flex-col gap-3 text-[0.9rem] uppercase tracking-[0.18em]">
            {items.map((item) => (
              <SheetClose asChild key={item.key}>
                <Link
                  href={item.href}
                  className="border-b border-[rgba(255,255,255,0.12)] py-2 text-muted transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto space-y-3 text-sm text-muted">
            <LocaleSwitcher />
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="block transition hover:text-foreground"
            >
              Instagram
            </a>
            <a
              href={siteConfig.social.soundcloud}
              target="_blank"
              rel="noreferrer"
              className="block transition hover:text-foreground"
            >
              SoundCloud
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
