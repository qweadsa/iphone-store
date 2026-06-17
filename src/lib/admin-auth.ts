import { cookies } from "next/headers";
import {
  cookieSecureFlag,
  createSessionToken,
  parseSessionToken,
} from "@/lib/session-token";

export const ADMIN_COOKIE = "iphone_admin";
const ADMIN_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

export async function buildAdminCookie() {
  const value = await createSessionToken("admin", "1", ADMIN_MAX_AGE);
  return {
    name: ADMIN_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecureFlag(),
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  };
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const session = await parseSessionToken(raw);
  return session?.kind === "admin";
}

export async function requireAdmin() {
  const ok = await isAdminLoggedIn();
  if (!ok) throw new Error("UNAUTHORIZED");
}

export async function verifyAdminCookieValue(raw: string | undefined): Promise<boolean> {
  if (!raw) return false;
  const session = await parseSessionToken(raw);
  return session?.kind === "admin";
}
