"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  imageUrl: string | null;
  active: boolean;
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return [];
        }
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-white/50">加载中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">产品管理</h1>
          <p className="mt-1 text-white/50">
            添加产品、上传图片、设置分类与价格（Navicat 手动添加也会同步显示）
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-black"
        >
          + 添加产品
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {products.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 p-8 text-center text-white/50">
            <p>暂无产品。可在后台添加，或在 Navicat 的 products 表插入数据。</p>
            <p className="mt-2 text-xs">SQL 示例：scripts/navicat-add-product.sql</p>
          </div>
        )}
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-500/30"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/10">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
              ) : (
                <span className="flex h-full items-center justify-center text-2xl">📱</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-white/40">{p.slug} · {p.category}</p>
            </div>
            <span className={`text-xs ${p.active ? "text-green-400" : "text-red-400"}`}>
              {p.active ? "上架" : "下架"}
            </span>
            <span className="text-white/30">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
