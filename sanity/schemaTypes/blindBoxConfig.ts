import { defineField, defineType } from "sanity";

export const blindBoxConfig = defineType({
  name: "blindBoxConfig",
  title: "盲盒设置 / Mystery Box Settings",
  type: "document",
  fields: [
    defineField({
      name: "price",
      title: "抽奖价格 (RM)",
      type: "number",
      initialValue: 60,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "enabled",
      title: "开启盲盒活动",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "grandPrizeName",
      title: "终极大奖名称",
      type: "string",
      initialValue: "iPhone 17 Pro Max",
    }),
    defineField({
      name: "grandPrizeValue",
      title: "终极大奖价值",
      type: "string",
      initialValue: "$1,199",
    }),
    defineField({
      name: "heroTitle",
      title: "首页横幅标题",
      type: "string",
      initialValue: "Win an iPhone 17 Pro Max",
    }),
    defineField({
      name: "heroSubtitle",
      title: "首页横幅副标题",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "grandPrizeImage",
      title: "终极大奖图片",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "seoTitle",
      title: "盲盒页 SEO 标题",
      type: "string",
      description: "针对 Google 搜索优化，例如: Win iPhone 17 Pro Max - $60 Mystery Box",
    }),
    defineField({
      name: "seoDescription",
      title: "盲盒页 SEO 描述",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "dailyLimit",
      title: "每日抽奖上限（0 = 不限）",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    prepare: () => ({ title: "盲盒全局设置" }),
  },
});
