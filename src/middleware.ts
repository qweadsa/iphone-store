import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookieValue } from "@/lib/admin-auth";
import { isProduction } from "@/lib/session-token";

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  if (isProduction()) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProduction()) {
    const proto = request.headers.get("x-forwarded-proto");
    const host = request.headers.get("host")?.split(":")[0] ?? "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const siteHost = siteUrl.replace(/^https?:\/\//, "").split("/")[0] ?? "";
  const shouldForceHttps =
      proto === "http" &&
      siteUrl.startsWith("https://") &&
      (host === siteHost || host === `www.${siteHost}`);

    if (shouldForceHttps) {
      const target = new URL(request.nextUrl.pathname + request.nextUrl.search, siteUrl);
      return withSecurityHeaders(NextResponse.redirect(target));
    }
  }

  if (!pathname.startsWith("/admin")) {
    return withSecurityHeaders(NextResponse.next());
  }

  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const loggedIn = await verifyAdminCookieValue(adminToken);

  if (pathname === "/admin/login") {
    if (loggedIn) {
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/admin", request.url)),
      );
    }
    return withSecurityHeaders(NextResponse.next());
  }

  if (!loggedIn) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/admin/login", request.url)),
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
