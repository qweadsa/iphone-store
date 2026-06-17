"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  ProductColorEditor,
  ProductStorageEditor,
  validateColors,
  validateStorage,
  type ProductColor,
  type StorageOption,
} from "@/components/admin/ProductVariantEditors";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

type Product = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  badge: string | null;
  imageUrl: string | null;
  storageOptions: StorageOption[];
  colors: ProductColor[];
  features: string[];
  active: boolean;
};

export default function ProductEditClient({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");
  const [colors, setColors] = useState<ProductColor[]>([{ name: "", hex: "#F6D365" }]);
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>([
    { size: "1TB", price: 7999 },
  ]);
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((p: Product) => {
        setProduct(p);
        setColors(p.colors?.length ? p.colors : [{ name: "", hex: "#F6D365" }]);
        setStorageOptions(
          p.storageOptions?.length ? p.storageOptions : [{ size: "1TB", price: 7999 }],
        );
        setFeaturesText(p.features.join("\n"));
      });
  }, [id]);

  async function save() {
    if (!product) return;

    const colorError = validateColors(colors);
    if (colorError) {
      setMsg(`❌ 外观颜色：${colorError}`);
      return;
    }
    const storageError = validateStorage(storageOptions);
    if (storageError) {
      setMsg(`❌ 存储 & 价格：${storageError}`);
      return;
    }

    setMsg("保存中...");
    const features = featuresText.split("\n").filter(Boolean);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...product,
        colors: colors.map((c) => ({ name: c.name.trim(), hex: c.hex.trim() })),
        storageOptions,
        features,
      }),
    });
    setMsg(res.ok ? "✅ 已保存，刷新前台即可看到" : "❌ 保存失败");
  }

  if (!product) return <p className="text-white/50">加载中...</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-white/50 hover:text-white">
        ← 返回列表
      </button>
      <h1 className="mt-4 text-2xl font-bold">编辑产品</h1>
      {msg && <p className="mt-2 text-sm text-amber-400">{msg}</p>}

      <div className="mt-6 space-y-4">
        <ImageUpload
          value={product.imageUrl ?? ""}
          onChange={(url) => setProduct({ ...product, imageUrl: url || null })}
        />

        <label className="block text-sm">
          <span className="text-white/70">产品名称</span>
          <input
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">URL 标识 (slug)</span>
          <input
            value={product.slug}
            onChange={(e) => setProduct({ ...product, slug: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">宣传语</span>
          <input
            value={product.tagline}
            onChange={(e) => setProduct({ ...product, tagline: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">描述</span>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">分类</span>
          <select
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.labelZh}
              </option>
            ))}
          </select>
        </label>

        <div className="block text-sm">
          <span className="text-white/70">外观颜色</span>
          <div className="mt-2">
            <ProductColorEditor colors={colors} onChange={setColors} />
          </div>
        </div>

        <div className="block text-sm">
          <span className="text-white/70">存储 & 价格</span>
          <div className="mt-2">
            <ProductStorageEditor options={storageOptions} onChange={setStorageOptions} />
          </div>
        </div>

        <label className="block text-sm">
          <span className="text-white/70">产品亮点（每行一条）</span>
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) => setProduct({ ...product, active: e.target.checked })}
          />
          <span className="text-white/70">上架显示</span>
        </label>

        <button
          onClick={save}
          className="rounded-lg bg-amber-500 px-8 py-3 text-sm font-bold text-black"
        >
          保存产品
        </button>
      </div>
    </div>
  );
}
