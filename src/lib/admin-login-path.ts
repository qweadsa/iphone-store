import { isProduction } from "@/lib/session-token";

export const DEFAULT_ADMIN_PASSWORD = "admin123";

export function getAdminLoginSlug(): string | null {
  const slug = process.env.ADMIN_LOGIN_SLUG?.trim();
  if (!slug) return null;
  if (!/^[a-z0-9][a-z0-9-]{5,48}[a-z0-9]$/i.test(slug)) return null;
  return slug;
}

export function getAdminLoginPath(): string {
  const slug = getAdminLoginSlug();
  if (slug && isProduction()) return `/admin/${slug}`;
  return "/admin/login";
}

export function isAdminLoginPathname(pathname: string): boolean {
  if (pathname === "/admin/login") {
    const slug = getAdminLoginSlug();
    return !slug || !isProduction();
  }
  const slug = getAdminLoginSlug();
  return !!slug && pathname === `/admin/${slug}`;
}

export function isProductionAdminPasswordConfigured(): boolean {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!password) return false;
  if (password === DEFAULT_ADMIN_PASSWORD) return false;
  if (password.length < 12) return false;
  return true;
}
