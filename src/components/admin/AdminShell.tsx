"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/admin", label: "概览", icon: "📊" },
  { href: "/admin/traffic", label: "访问统计", icon: "👁️" },
  { href: "/admin/blindbox", label: "盲盒管理", icon: "🎁" },
  { href: "/admin/products", label: "产品管理", icon: "📱" },
  { href: "/admin/orders", label: "订单查询", icon: "📋" },
  { href: "/admin/payments", label: "收款 & 支付", icon: "💳" },
  { href: "/admin/settings", label: "站点设置", icon: "⚙️" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { loginPath?: string };
    router.push(data.loginPath ?? "/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0c10]">
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
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
