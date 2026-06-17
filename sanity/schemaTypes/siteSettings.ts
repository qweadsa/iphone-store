import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "网站设置 / Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "网站名称",
      type: "string",
      initialValue: "iPhone Store",
    }),
    defineField({
      name: "homeSeoTitle",
      title: "首页 SEO 标题",
      type: "string",
    }),
    defineField({
      name: "homeSeoDescription",
      title: "首页 SEO 描述",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "社交分享图 (Open Graph)",
      type: "image",
      description: "分享到 Facebook/Twitter 时显示的图片",
    }),
    defineField({
      name: "supportPhone",
      title: "客服电话",
      type: "string",
      initialValue: "1-800-IPHONE",
    }),
    defineField({
      name: "supportEmail",
      title: "客服邮箱",
      type: "string",
      initialValue: "support@iphone-store.com",
    }),
  ],
  preview: {
    prepare: () => ({ title: "全站设置" }),
  },
});
