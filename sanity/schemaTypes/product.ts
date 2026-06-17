import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "产品 / Products",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "产品名称",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL 标识 (slug)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "宣传语",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "产品描述",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "category",
      title: "分类",
      type: "string",
      options: {
        list: [
          { title: "Pro 系列", value: "pro" },
          { title: "标准版", value: "standard" },
          { title: "SE 系列", value: "se" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "badge",
      title: "标签",
      type: "string",
      options: {
        list: [
          { title: "新款 New", value: "new" },
          { title: "热销 Hot", value: "hot" },
          { title: "超值 Value", value: "value" },
        ],
      },
    }),
    defineField({
      name: "image",
      title: "主图（上传真实产品图）",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "图片描述 (SEO)", type: "string" }),
      ],
    }),
    defineField({
      name: "storageOptions",
      title: "存储容量 & 价格",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "size", title: "容量", type: "string" }),
            defineField({ name: "price", title: "价格 (USD)", type: "number" }),
          ],
          preview: {
            select: { size: "size", price: "price" },
            prepare: ({ size, price }) => ({
              title: `${size} — $${price}`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: "colors",
      title: "颜色选项",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "颜色名", type: "string" }),
            defineField({
              name: "hex",
              title: "色值 (#hex)",
              type: "string",
              description: "例如 #1D1D1F",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "features",
      title: "产品亮点",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO 标题",
      type: "string",
      description: "Google 搜索显示的标题",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO 描述",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "active",
      title: "上架",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "排序（数字越小越靠前）",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", media: "image", active: "active" },
    prepare: ({ title, media, active }) => ({
      title: active ? title : `[下架] ${title}`,
      media,
    }),
  },
});
