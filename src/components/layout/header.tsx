import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { InstagramIcon, MusicIcon, YoutubeIcon, TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function Header({ className }: { className?: string }) {
  const t = await getTranslations("navigation");
  const items = siteConfig.navigation.map((item) => ({
    ...item,
    label: t(item.key),
  }));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-accent bg-background",
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href="/"
          className="group flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.24em]"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm border border-foreground/30 bg-surface transition-colors group-hover:border-accent">
            <Image
              src="/media/aer-logo.jpg"
              alt={`${siteConfig.name} logo`}
              width={28}
              height={28}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="font-display text-xl leading-none text-foreground transition-colors group-hover:text-accent md:text-2xl">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[0.68rem] uppercase tracking-[0.22em] text-muted md:flex">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-accent"
            aria-label="Instagram"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social.soundcloud}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-accent"
            aria-label="SoundCloud"
          >
            <MusicIcon className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-accent"
            aria-label="YouTube"
          >
            <YoutubeIcon className="h-4 w-4" />
          </a>
          <Button
            asChild
            variant="primary"
            size="sm"
            className="items-center gap-2 tracking-[0.2em]"
            data-beam=""
          >
            <Link href="/tickets">
              <TicketIcon className="h-4 w-4" />
              Tickets
            </Link>
          </Button>
          <LocaleSwitcher />
        </div>
        <MobileNav items={items} />
      </div>
    </header>
  );
}
