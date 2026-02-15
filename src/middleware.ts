import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "./middleware/client-ip";
import { serverConfig } from "./server/config";
import { i18nConfig } from "./i18n/config";

const canonicalHost = (() => {
  try {
    const url = new URL(serverConfig.nextPublicAppUrl);
    return url.host;
  } catch {
    return null;
  }
})();

const getHostInfo = (host: string | null | undefined) => {
  if (!host) return null;
  const trimmed = host.split(",")[0].trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("[")) {
    const endIndex = lower.indexOf("]");
    if (endIndex === -1) return null;
    const hostname = lower.slice(1, endIndex);
    const rest = lower.slice(endIndex + 1);
    const port = rest.startsWith(":") ? rest.slice(1) : undefined;
    return { raw: trimmed, hostname, port };
  }
  const [hostname, port] = lower.split(":");
  return { raw: trimmed, hostname, port };
};

const isLocalHost = (host: string | null | undefined) => {
  const info = getHostInfo(host);
  if (!info) return false;
  const { hostname } = info;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  );
};

const getRequestHost = (request: NextRequest) => {
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const normalizedHost = getHostInfo(host)?.raw ?? null;
  const normalizedForwarded = getHostInfo(forwardedHost)?.raw ?? null;

  if (!normalizedHost) {
    return normalizedForwarded;
  }

  if (normalizedForwarded && isLocalHost(normalizedHost) && !isLocalHost(normalizedForwarded)) {
    return normalizedForwarded;
  }

  return normalizedHost;
};

const applyRequestHost = (url: URL, requestHost: string | null) => {
  const info = getHostInfo(requestHost);
  if (!info) return;
  url.hostname = info.hostname;
  url.port = isLocalHost(requestHost) ? info.port ?? "" : "";
};

const getRequestProtocol = (request: NextRequest, requestHost: string | null) => {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  if (forwardedProto && !isLocalHost(requestHost)) {
    return forwardedProto;
  }
  return request.nextUrl.protocol.replace(":", "");
};

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
  const requestHost = getRequestHost(request);
  const method = request.method.toUpperCase();
  const contentType = request.headers.get("content-type") ?? "";
  const hasActionHeader = request.headers.has("next-action");
  const isApiRoute = pathname.startsWith("/api");
  const isStudioRoute = pathname.startsWith("/studio");

  // Block unexpected non-idempotent methods on non-API routes to prevent
  // server-action abuse on generic POSTs.
  if (!isApiRoute && !isStudioRoute && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // Explicitly reject requests that would be treated as Server Actions by Next.js.
  if (
    !isApiRoute &&
    method === "POST" &&
    (hasActionHeader ||
      contentType.startsWith("application/x-www-form-urlencoded") ||
      contentType.startsWith("multipart/form-data"))
  ) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const isRequestLocalHost = isLocalHost(requestHost);
  const isCanonicalLocalHost = isLocalHost(canonicalHost);
  const shouldRedirectHost =
    canonicalHost &&
    requestHost &&
    !isRequestLocalHost &&
    requestHost !== canonicalHost &&
    !requestHost.endsWith(".vercel.app") &&
    !isCanonicalLocalHost;

  if (shouldRedirectHost) {
    const url = request.nextUrl.clone();
    const requestProtocol = getRequestProtocol(request, requestHost);
    if (requestProtocol) {
      url.protocol = requestProtocol;
    }
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
    const requestProtocol = getRequestProtocol(request, requestHost);
    applyRequestHost(url, requestHost);
    if (requestProtocol) {
      url.protocol = requestProtocol;
    }
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
