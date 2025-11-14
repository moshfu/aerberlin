import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { SpinningMark } from "@/components/motion/spinning-mark";
const navItems = siteConfig.navigation.map((item) => ({
  key: item.key,
  href: item.href,
  label: item.key.toUpperCase(),
}));

export async function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="h-1.5 w-full bg-accent" />
      <div className="bg-transparent px-4 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          {siteConfig.brand.logo ? (
            <Link
              href="/"
              className="aer-header-logo shrink-0"
              aria-label={`${siteConfig.name} home`}
            >
              <SpinningMark
                size={360}
                orbitScale={0.72}
                className="aer-logo"
                imageSrc={siteConfig.brand.logo}
                imageAlt={`${siteConfig.name} logo`}
              />
            </Link>
          ) : null}

          <nav className="aer-header-nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} className="aer-nav-button aer-nav-button--compact">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
