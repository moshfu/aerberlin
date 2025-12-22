import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "./src/middleware/client-ip";
import { serverConfig } from "./src/server/config";
import { i18nConfig } from "./src/i18n/config";

const canonicalHost = (() => {
  try {
    const url = new URL(serverConfig.nextPublicAppUrl);
    return url.host;
  } catch {
    return null;
  }
})();

const intlMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: i18nConfig.localePrefix,
});

const PUBLIC_FILE = /\.(.*)$/;
const BASIC_AUTH_REALM = "Preview";

const allowlistedIps = ["89.247.171.161", "91.66.20.84"];

const requiredUsername = serverConfig.previewUser;
const requiredPassword = serverConfig.previewPass;
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

  const clientIp = getClientIp(request);
  if (clientIp && allowlistedIps.includes(clientIp)) {
    return null;
  }

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
  const requestHost = request.headers.get("host");

  const isLocalHost = requestHost?.startsWith("localhost") || requestHost?.startsWith("127.0.0.1");
  const shouldRedirectHost =
    canonicalHost &&
    requestHost &&
    !isLocalHost &&
    requestHost !== canonicalHost &&
    !requestHost.endsWith(".vercel.app");

  if (shouldRedirectHost) {
    const url = request.nextUrl.clone();
    url.host = canonicalHost!;
    return NextResponse.redirect(url, 301);
  }

  const isNextAuthRoute = pathname.startsWith("/api/auth");

  const isPublicAsset =
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/cursor");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (isNextAuthRoute) {
    // Avoid basic auth challenges and locale rewrites on NextAuth endpoints so
    // cookies and callbacks work end-to-end.
    return NextResponse.next();
  }

  const authResponse = enforceBasicAuth(request);
  if (authResponse) {
    return authResponse;
  }

  if (pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  const hasLocalePrefix = i18nConfig.locales.some((locale) =>
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const shouldRewriteToDefault =
    !hasLocalePrefix &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/studio") &&
    !PUBLIC_FILE.test(pathname);

  if (shouldRewriteToDefault) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/"
        ? `/${i18nConfig.defaultLocale}`
        : `/${i18nConfig.defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/image|_next/static|favicon.ico|robots.txt|sitemap.xml).*)"],
};
