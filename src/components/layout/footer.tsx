import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/routing";

export async function Footer() {
  const year = new Date().getFullYear();
  const navigation = await getTranslations("navigation");

  return (
    <footer className="border-t border-accent bg-background">
      <div className="container flex flex-col items-center gap-2 py-4 text-[0.58rem] uppercase tracking-[0.32em] text-accent sm:flex-row sm:justify-between">
        <p className="text-center sm:text-left">
          © {year} {siteConfig.name}
        </p>
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-4 text-[0.54rem] tracking-[0.24em] sm:justify-end"
        >
          {siteConfig.legalLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {navigation(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
