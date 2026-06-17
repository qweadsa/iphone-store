import { timingSafeEqual } from "node:crypto";
import { isProduction } from "@/lib/session-token";
import {
  DEFAULT_ADMIN_PASSWORD,
  isProductionAdminPasswordConfigured,
} from "@/lib/admin-login-path";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type AttemptState = { fails: number; lockedUntil: number };

const attempts = new Map<string, AttemptState>();

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneLocked() {
  const now = Date.now();
  for (const [ip, state] of attempts) {
    if (state.lockedUntil > 0 && state.lockedUntil <= now && state.fails === 0) {
      attempts.delete(ip);
    }
  }
}

export function securePasswordMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkLoginAllowed(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  pruneLocked();

  if (isProduction() && !isProductionAdminPasswordConfigured()) {
    return {
      ok: false,
      status: 503,
      error: "服务器未配置安全管理员密码，请在 .env 设置 ADMIN_PASSWORD（至少12位）",
    };
  }

  const ip = clientIp(req);
  const state = attempts.get(ip);
  if (state && state.lockedUntil > Date.now()) {
    const mins = Math.ceil((state.lockedUntil - Date.now()) / 60000);
    return {
      ok: false,
      status: 429,
      error: `尝试次数过多，请 ${mins} 分钟后再试`,
    };
  }

  return { ok: true };
}

export function recordLoginFailure(req: Request): void {
  const ip = clientIp(req);
  const state = attempts.get(ip) ?? { fails: 0, lockedUntil: 0 };
  state.fails += 1;
  if (state.fails >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_MS;
    state.fails = 0;
  }
  attempts.set(ip, state);
}

export function recordLoginSuccess(req: Request): void {
  attempts.delete(clientIp(req));
}

export { DEFAULT_ADMIN_PASSWORD };
