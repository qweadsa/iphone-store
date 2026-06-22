import { NextResponse } from "next/server";
import { buildUserCookie } from "@/lib/user-auth";
import {
  authDoneRedirect,
  authErrorRedirect,
  fetchGoogleProfile,
  isGoogleAuthConfigured,
  parseOAuthState,
} from "@/lib/google-oauth";
import { findOrCreateGoogleUser } from "@/lib/google-user";

export async function GET(req: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(authErrorRedirect("google_not_configured"));
  }

  const { searchParams } = new URL(req.url);
  const oauthError = searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(authErrorRedirect("google_denied"));
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(authErrorRedirect("google_invalid"));
  }

  const statePayload = await parseOAuthState(state);
  if (!statePayload) {
    return NextResponse.redirect(authErrorRedirect("google_invalid"));
  }

  try {
    const profile = await fetchGoogleProfile(code);
    const user = await findOrCreateGoogleUser(profile);
    const res = NextResponse.redirect(
      authDoneRedirect(statePayload.next, statePayload.claimPayment),
    );
    res.cookies.set(await buildUserCookie(user.id));
    return res;
  } catch (e) {
    if (e instanceof Error && e.message === "GOOGLE_ACCOUNT_CONFLICT") {
      return NextResponse.redirect(authErrorRedirect("google_conflict", "/login"));
    }
    return NextResponse.redirect(authErrorRedirect("google_failed", "/login"));
  }
}
