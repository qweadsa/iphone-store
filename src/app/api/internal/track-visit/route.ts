import { NextResponse } from "next/server";
import { getSessionSecret } from "@/lib/session-token";
import {
  buildVisitorKey,
  isLikelyBot,
  recordSiteVisit,
} from "@/lib/site-analytics";

function trackSecretOk(req: Request): boolean {
  const header = req.headers.get("x-track-secret") ?? "";
  return header === getSessionSecret();
}

export async function POST(req: Request) {
  if (!trackSecretOk(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { path?: string; persistedVisitorId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const path = String(body.path ?? "/").slice(0, 500);
  const userAgent = req.headers.get("user-agent");
  if (isLikelyBot(userAgent)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const referrer = req.headers.get("referer");

  try {
    await recordSiteVisit({
      visitorHash: buildVisitorKey({
        persistedVisitorId: body.persistedVisitorId,
        ip,
        userAgent,
      }),
      path,
      referrer,
      userAgent,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
