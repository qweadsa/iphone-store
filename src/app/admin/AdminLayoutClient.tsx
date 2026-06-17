"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

const ADMIN_PANEL_PREFIXES = [
  "/admin/blindbox",
  "/admin/traffic",
  "/admin/payments",
  "/admin/orders",
  "/admin/products",
  "/admin/settings",
];

function isLoginPath(pathname: string): boolean {
  if (pathname === "/admin/login") return true;
  if (pathname === "/admin") return false;
  if (!pathname.startsWith("/admin/")) return false;
  if (ADMIN_PANEL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false;
  }
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 2;
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (isLoginPath(pathname)) {
    return <>{children}</>;
  }
  return <AdminShell>{children}</AdminShell>;
}
