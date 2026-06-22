import { NextResponse } from "next/server";
import {
  authErrorRedirect,
  buildGoogleAuthUrl,
  createOAuthState,
  isGoogleAuthConfigured,
} from "@/lib/google-oauth";

export async function GET(req: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(authErrorRedirect("google_not_configured"));
  }

  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next")?.trim() || "/";
  const claimPayment = searchParams.get("claimPayment")?.trim() || "";

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const state = await createOAuthState({ next: safeNext, claimPayment });
  const url = buildGoogleAuthUrl(state);

  return NextResponse.redirect(url);
}
