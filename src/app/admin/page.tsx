import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_BLIND_BOX_PRICE,
  formatAdminPrice,
  normalizeBlindBoxConfig,
} from "@/lib/market";
import TestDataCleanup from "@/components/admin/TestDataCleanup";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, prizeCount, orderCount, userCount, config] = await Promise.all([
    prisma.product.count(),
    prisma.blindBoxPrize.count(),
    prisma.order.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.blindBoxConfig.findFirst({ where: { id: 1 } }).then((c) => (c ? normalizeBlindBoxConfig(c) : null)),
  ]);

  const blindBoxPrice = formatAdminPrice(config?.price ?? DEFAULT_BLIND_BOX_PRICE);

  return (
    <div>
      <h1 className="text-2xl font-bold">管理概览</h1>
      <p className="mt-1 text-white/50">
        在网页或 Navicat 修改产品，保存后刷新前台即可
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "产品数量", value: productCount, href: "/admin/products" },
          { label: "订单数量", value: orderCount, href: "/admin/orders" },
          { label: "注册用户", value: userCount, href: "/admin/users" },
          { label: "盲盒奖品", value: prizeCount, href: "/admin/blindbox" },
          { label: "盲盒价格", value: blindBoxPrice, href: "/admin/blindbox" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-500/30"
          >
            <p className="text-sm text-white/50">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">{item.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold">快速操作</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/traffic" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/20">
            直播访问统计
          </Link>
          <Link href="/admin/blindbox" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black">
            修改盲盒概率
          </Link>
          <Link href="/admin/products/new" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            添加产品
          </Link>
          <Link href="/admin/orders" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            查询订单
          </Link>
          <Link href="/admin/users" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            注册用户
          </Link>
          <Link href="/admin-setup" target="_blank" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            网站状态
          </Link>
        </div>
      </div>

      <TestDataCleanup />
    </div>
  );
}
