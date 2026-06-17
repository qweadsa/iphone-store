import Link from "next/link";
import { testDbConnection, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const connected = await testDbConnection();
  let productCount = 0;
  let activeCount = 0;
  if (connected) {
    productCount = await prisma.product.count();
    activeCount = await prisma.product.count({ where: { active: true } });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">网站状态</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        本地开发环境 · Navicat 数据库直连
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <Row
          label="网站前台"
          value="http://localhost:3000"
          href="http://localhost:3000"
        />
        <Row
          label="后台登录"
          value="http://localhost:3000/admin/login"
          href="/admin/login"
        />
        <Row label="数据库" value={connected ? "已连接 ✓" : "未连接 ✗"} />
        <Row label="产品总数" value={String(productCount)} />
        <Row label="上架产品" value={String(activeCount)} />
        <Row
          label="产品 API"
          value="/api/products"
          href="/api/products"
        />
        <Row
          label="健康检查"
          value="/api/health"
          href="/api/health"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm">
        <h2 className="font-bold text-amber-900">Navicat 添加产品</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-amber-900/80">
          <li>确认 MySQL 已启动，数据库名 <code>iphone_store</code></li>
          <li>
            参考 SQL 示例：
            <code className="ml-1">scripts/navicat-add-product.sql</code>
          </li>
          <li>
            必填：<code>slug</code>、<code>active=1</code>、JSON 字段格式正确
          </li>
          <li>保存后刷新前台 /products 即可看到</li>
        </ol>
        <p className="mt-4 text-xs text-amber-800/70">
          后台密码见 .env.local → ADMIN_PASSWORD（默认 admin123）
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/login"
          className="rounded-xl bg-[var(--color-brand)] px-6 py-3 text-sm font-bold text-white"
        >
          进入后台
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-black/10 px-6 py-3 text-sm font-medium"
        >
          查看产品
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-3 last:border-0 last:pb-0">
      <span className="text-[var(--color-muted)]">{label}</span>
      {href ? (
        <Link href={href} className="font-medium text-[var(--color-brand)] hover:underline">
          {value}
        </Link>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  );
}
