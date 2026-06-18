import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminLoginPath,
  getAdminLoginSlug,
  isAdminLoginPathname,
  verifyAdminCookieValue,
} from "@/lib/admin-auth";
import { getSessionSecret, isProduction } from "@/lib/session-token";
import { shouldTrackVisit } from "@/lib/site-analytics";

const VISITOR_COOKIE = "vs_vid";

function internalTrackVisitUrl(request: NextRequest): string {
  const port = process.env.PORT?.trim() || "3000";
  if (isProduction()) {
    return `http://127.0.0.1:${port}/api/internal/track-visit`;
  }
  return new URL("/api/internal/track-visit", request.url).toString();
}

function queueVisitTrack(event: NextFetchEvent, request: NextRequest, visitorId: string) {
  const secret = getSessionSecret();
  const path = request.nextUrl.pathname + request.nextUrl.search;
  event.waitUntil(
    fetch(internalTrackVisitUrl(request), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-track-secret": secret,
        "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
        "x-real-ip": request.headers.get("x-real-ip") ?? "",
        "user-agent": request.headers.get("user-agent") ?? "",
        referer: request.headers.get("referer") ?? "",
        host: request.headers.get("host") ?? "",
      },
      body: JSON.stringify({ path, visitorId }),
    }).catch(() => undefined),
  );
}

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

export async function middleware(request: NextRequest, event: NextFetchEvent) {
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
    const res = withSecurityHeaders(NextResponse.next());
    if (shouldTrackVisit(pathname)) {
      let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        res.cookies.set(VISITOR_COOKIE, visitorId, {
          maxAge: 60 * 60 * 24 * 30,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: isProduction(),
        });
      }
      queueVisitTrack(event, request, visitorId);
    }
    return res;
  }

  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const loggedIn = await verifyAdminCookieValue(adminToken);
  const loginPath = getAdminLoginPath();

  if (isAdminLoginPathname(pathname)) {
    if (loggedIn) {
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/admin", request.url)),
      );
    }
    return withSecurityHeaders(NextResponse.next());
  }

  // 配置了私密路径后，关闭公开的 /admin/login
  if (pathname === "/admin/login" && isProduction() && getAdminLoginSlug()) {
    return withSecurityHeaders(new NextResponse("Not Found", { status: 404 }));
  }

  if (!loggedIn) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL(loginPath, request.url)),
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|payments|prizes).*)"],
};
