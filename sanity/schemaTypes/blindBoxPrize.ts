import { defineField, defineType } from "sanity";

export const blindBoxPrize = defineType({
  name: "blindBoxPrize",
  title: "盲盒奖品 / Mystery Box Prizes",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "奖品名称",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "prizeType",
      title: "奖品类型",
      type: "string",
      options: {
        list: [
          { title: "🏆 终极大奖 (Grand)", value: "grand" },
          { title: "💰 商城抵扣券", value: "credit" },
          { title: "📦 手机壳", value: "case" },
          { title: "🎟️ 优惠券", value: "coupon" },
          { title: "🍀 再接再厉", value: "retry" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "weight",
      title: "概率权重",
      type: "number",
      description:
        "数字越大，中奖概率越高。例如：大奖=1，再接再厉=944。实际概率 = 该权重 ÷ 所有活跃奖品权重之和",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "emoji",
      title: "表情图标",
      type: "string",
      description: "例如 📱 💰 🎁",
    }),
    defineField({
      name: "image",
      title: "奖品图片（可选）",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "active",
      title: "启用",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "排序",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", weight: "weight", emoji: "emoji", active: "active" },
    prepare: ({ title, weight, emoji, active }) => ({
      title: `${emoji ?? "🎁"} ${active ? title : `[停用] ${title}`}`,
      subtitle: `权重: ${weight}`,
    }),
  },
});
