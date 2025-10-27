import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/routing";

export async function Footer() {
  const year = new Date().getFullYear();
  const navigation = await getTranslations("navigation");

  return (
    <footer className="relative z-10 bg-background">
      <div className="h-px w-full bg-accent" />
      <div className="container flex flex-col items-center gap-2 py-3 text-[0.6rem] uppercase tracking-[0.28em] text-accent/80 sm:flex-row sm:justify-between">
        <p className="text-center sm:text-left">© {year} {siteConfig.name}</p>
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {siteConfig.legalLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="aer-nav-button aer-nav-button--compact"
            >
              {navigation(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
