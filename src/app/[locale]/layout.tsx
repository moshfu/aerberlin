import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppProviders } from "@/components/providers/app-providers";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { locales } from "@/i18n/routing";
import { Locale } from "@/config/site";
import { auth } from "@/lib/auth";
import { Analytics } from "@/components/analytics/analytics";
import { AdminMenu } from "@/components/admin/admin-menu";
import { parseCookieConsent, COOKIE_CONSENT_COOKIE } from "@/lib/cookie-consent";
import { CookieBanner } from "@/components/cookie-consent/cookie-banner";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = "force-static";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  let messages: Record<string, unknown>;
  try {
    messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  const session = await auth();
  const cookieStore = cookies();
  const consentCookie = cookieStore.get(COOKIE_CONSENT_COOKIE)?.value;
  const allowAnalytics = parseCookieConsent(consentCookie) === "analytics";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders session={session}>
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground isolate">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics allowAnalytics={allowAnalytics} />
          <AdminMenu />
          <CookieBanner />
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
