import { OAuth2Client } from "google-auth-library";
import { createSessionToken, parseSessionToken } from "@/lib/session-token";

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
};

export type OAuthStatePayload = {
  next: string;
  claimPayment: string;
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getGoogleRedirectUri(): string {
  return `${siteUrl()}/api/auth/google/callback`;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

function oauthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_NOT_CONFIGURED");
  }
  return new OAuth2Client(clientId, clientSecret, getGoogleRedirectUri());
}

export async function createOAuthState(payload: OAuthStatePayload): Promise<string> {
  const next = payload.next.startsWith("/") ? payload.next : "/";
  const claimPayment = payload.claimPayment.trim();
  const id = `${encodeURIComponent(next)}|${encodeURIComponent(claimPayment)}`;
  return createSessionToken("user", id, 600);
}

export async function parseOAuthState(state: string): Promise<OAuthStatePayload | null> {
  const parsed = await parseSessionToken(state);
  if (!parsed || parsed.kind !== "user") return null;

  const [nextEnc, claimEnc] = parsed.id.split("|");
  if (!nextEnc) return null;

  let next = "/";
  let claimPayment = "";
  try {
    next = decodeURIComponent(nextEnc);
    claimPayment = claimEnc ? decodeURIComponent(claimEnc) : "";
  } catch {
    return null;
  }

  if (!next.startsWith("/") || next.startsWith("//")) next = "/";
  return { next, claimPayment };
}

export function buildGoogleAuthUrl(state: string): string {
  const client = oauthClient();
  return client.generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state,
  });
}

export async function fetchGoogleProfile(code: string): Promise<GoogleProfile> {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;
  if (!idToken) throw new Error("GOOGLE_NO_ID_TOKEN");

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID?.trim(),
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error("GOOGLE_INCOMPLETE_PROFILE");

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0] || "User",
  };
}

export function authErrorRedirect(code: string, next = "/login"): string {
  const base = siteUrl();
  const url = new URL(next.startsWith("/") ? next : "/login", base);
  url.searchParams.set("error", code);
  return url.toString();
}

export function authDoneRedirect(next: string, claimPayment: string): string {
  const base = siteUrl();
  const url = new URL("/auth/done", base);
  url.searchParams.set("next", next.startsWith("/") ? next : "/");
  if (claimPayment) url.searchParams.set("claimPayment", claimPayment);
  return url.toString();
}
