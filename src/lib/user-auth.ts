import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  cookieSecureFlag,
  createSessionToken,
  parseSessionToken,
} from "@/lib/session-token";

export const USER_COOKIE = "iphone_user";
const USER_MAX_AGE = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  balance: number;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;

  const session = await parseSessionToken(raw);
  if (!session || session.kind !== "user") return null;

  const id = Number(session.id);
  if (!Number.isFinite(id)) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function buildUserCookie(userId: number) {
  const value = await createSessionToken("user", String(userId), USER_MAX_AGE);
  return {
    name: USER_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecureFlag(),
    path: "/",
    maxAge: USER_MAX_AGE,
  };
}
