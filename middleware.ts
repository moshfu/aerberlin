import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { i18nConfig } from "./src/i18n/config";

const intlMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: i18nConfig.localePrefix,
});

const PUBLIC_FILE = /\.(.*)$/;
const BASIC_AUTH_REALM = "Preview";

const requiredUsername = process.env.PREVIEW_USER;
const requiredPassword = process.env.PREVIEW_PASS;
const shouldRequireAuth = Boolean(requiredUsername && requiredPassword);

const decodeBase64 = (value: string) => {
  try {
    return globalThis.atob(value);
  } catch {
    return null;
  }
};

const unauthorizedResponse = () =>
  new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${BASIC_AUTH_REALM}", charset="UTF-8"`,
    },
  });

const enforceBasicAuth = (request: NextRequest) => {
  if (!shouldRequireAuth) return null;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encodedCredentials = authorization.slice(6).trim();
  const decoded = decodeBase64(encodedCredentials);
  if (!decoded) {
    return unauthorizedResponse();
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return unauthorizedResponse();
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  if (username !== requiredUsername || password !== requiredPassword) {
    return unauthorizedResponse();
  }

  return null;
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authResponse = enforceBasicAuth(request);
  if (authResponse) {
    return authResponse;
  }

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
