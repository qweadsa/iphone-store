"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/admin", label: "概览", icon: "📊", short: "概览" },
  { href: "/admin/traffic", label: "访问统计", icon: "👁️", short: "流量" },
  { href: "/admin/blindbox", label: "盲盒管理", icon: "🎁", short: "盲盒" },
  { href: "/admin/products", label: "产品管理", icon: "📱", short: "产品" },
  { href: "/admin/orders", label: "订单查询", icon: "📋", short: "订单" },
  { href: "/admin/payments", label: "收款 & 支付", icon: "💳", short: "收款" },
  { href: "/admin/settings", label: "站点设置", icon: "⚙️", short: "设置" },
];

const mobileNav = nav.filter((item) =>
  ["/admin", "/admin/blindbox", "/admin/orders", "/admin/products", "/admin/payments"].includes(
    item.href,
  ),
);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { loginPath?: string };
    router.push(data.loginPath ?? "/admin/login");
    router.refresh();
  }

  const current = nav.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  );

  return (
    <div className="admin-shell flex min-h-screen bg-[#0f1117] text-white [color-scheme:dark]">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0c10] md:flex">
        <div className="border-b border-white/10 p-5">
          <p className="text-lg font-bold">🎁 管理后台</p>
          <p className="text-xs text-white/40">iPhone Store Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-amber-500/20 font-medium text-amber-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="block rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5"
          >
            ↗ 查看网站
          </Link>
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/50 hover:bg-white/5"
          >
            退出登录
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0a0c10] px-4 py-3 md:hidden">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {current?.icon} {current?.label ?? "管理后台"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60"
            >
              网站
            </Link>
            <button
              onClick={logout}
              className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60"
            >
              退出
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-28 md:p-8 md:pb-8">{children}</main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0c10]/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        aria-label="Admin mobile navigation"
      >
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {mobileNav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center rounded-xl px-1 py-2 text-center transition ${
                  active
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-white/55 hover:bg-white/5"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="mt-1 text-[10px] font-medium leading-tight">{item.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
