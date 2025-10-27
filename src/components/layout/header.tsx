import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "EVENTS", href: "/events" },
  { label: "ARTISTS", href: "/artists" },
  { label: "MUSIC", href: "/music" },
  { label: "ABOUT", href: "/about" },
] as const;

export async function Header({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 bg-background", className)}>
      <div className="h-2 w-full bg-accent" />
      <nav className="border-b border-accent bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="aer-nav-button"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
