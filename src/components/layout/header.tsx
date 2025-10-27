import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { SpinningMark } from "@/components/motion/spinning-mark";

const NAV_ITEMS = [
  { label: "EVENTS", href: "/events" },
  { label: "ARTISTS", href: "/artists" },
  { label: "MUSIC", href: "/music" },
  { label: "ABOUT", href: "/about" },
] as const;

export async function Header({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 bg-background", className)}>
      <div className="h-6 w-full bg-accent" />
      <div className="bg-background">
        {siteConfig.brand.logo ? (
          <Link href="/" className="aer-header-logo" aria-label={`${siteConfig.name} home`}>
            <SpinningMark
              size={220}
              className="aer-logo"
              imageSrc={siteConfig.brand.logo}
              imageAlt={`${siteConfig.name} logo`}
            />
          </Link>
        ) : null}
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4 py-5">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="aer-nav-button">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
