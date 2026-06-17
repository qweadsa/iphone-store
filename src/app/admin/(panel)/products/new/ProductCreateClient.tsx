"use client";

import { useState } from "react";
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

export default function ProductCreateClient() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("phone");
  const [badge, setBadge] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [colors, setColors] = useState<ProductColor[]>([{ name: "Kuning", hex: "#F6D365" }]);
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>([
    { size: "1TB", price: 7999 },
  ]);
  const [featuresText, setFeaturesText] = useState("");
  const [active, setActive] = useState(true);

  function autoSlug(value: string) {
    setName(value);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(value));
    }
  }

  async function create() {
    if (!name.trim() || !slug.trim()) {
      setMsg("❌ 请填写产品名称和 URL 标识");
      return;
    }
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
    setMsg("创建中...");
    const features = featuresText.split("\n").filter(Boolean);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        name: name.trim(),
        tagline,
        description,
        category,
        badge: badge || null,
        imageUrl: imageUrl || null,
        storageOptions,
        colors: colors.map((c) => ({ name: c.name.trim(), hex: c.hex.trim() })),
        features,
        active,
      }),
    });
    if (!res.ok) {
      setMsg("❌ 创建失败，请检查 slug 是否重复");
      return;
    }
    const product = await res.json();
    setMsg("✅ 产品已创建");
    router.push(`/admin/products/${product.id}`);
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="text-sm text-white/50 hover:text-white"
      >
        ← 返回列表
      </button>
      <h1 className="mt-4 text-2xl font-bold">添加新产品</h1>
      <p className="mt-1 text-sm text-white/50">上传图片、设置分类与价格</p>
      {msg && <p className="mt-2 text-sm text-amber-400">{msg}</p>}

      <div className="mt-6 space-y-4">
        <ImageUpload value={imageUrl} onChange={setImageUrl} />

        <label className="block text-sm">
          <span className="text-white/70">产品名称 *</span>
          <input
            value={name}
            onChange={(e) => autoSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">URL 标识 (slug) *</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="macbook-pro-m4"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">宣传语</span>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">描述</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-white/70">分类</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.icon} {c.labelZh}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-white/70">标签</span>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <option value="">无</option>
              <option value="new">新款</option>
              <option value="hot">热销</option>
              <option value="value">超值</option>
            </select>
          </label>
        </div>

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
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="text-white/70">创建后立即上架</span>
        </label>

        <button
          onClick={create}
          className="rounded-lg bg-amber-500 px-8 py-3 text-sm font-bold text-black"
        >
          创建产品
        </button>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}
