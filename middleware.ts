import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { i18nConfig } from "./src/i18n/config";

const intlMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: i18nConfig.localePrefix,
});

const PUBLIC_FILE = /\.(.*)$/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = i18nConfig.locales.some((locale) =>
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const shouldHandle =
    !hasLocalePrefix &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/studio") &&
    !PUBLIC_FILE.test(pathname);

  if (shouldHandle) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${i18nConfig.defaultLocale}` : `/${i18nConfig.defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/image|_next/static|favicon.ico|robots.txt|sitemap.xml).*)"],
};
