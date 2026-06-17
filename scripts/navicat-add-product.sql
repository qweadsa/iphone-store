-- Navicat 手动添加产品示例（数据库：iphone_store，表：products）
-- 在 Navicat 中选中 iphone_store → 查询 → 新建查询 → 粘贴执行
--
-- 重要：
-- 1. slug 必须唯一，也是网址 /products/你的slug
-- 2. active = 1 才会在前台显示
-- 3. category 用：phone / computer / camera / audio / watch
-- 4. storageOptions、colors、features 必须是合法 JSON

INSERT INTO `products` (
  `slug`,
  `name`,
  `tagline`,
  `description`,
  `category`,
  `badge`,
  `imageUrl`,
  `storageOptions`,
  `colors`,
  `features`,
  `active`,
  `sortOrder`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'my-new-phone',
  '我的新手机',
  '一句话卖点',
  '产品详细描述，会显示在详情页。',
  'phone',
  'new',
  NULL,
  '[{"size":"256GB","price":999},{"size":"512GB","price":1199}]',
  '[{"name":"Black","hex":"#1D1D1F"},{"name":"White","hex":"#F5F5F0"}]',
  '["5G","双卡","快充"]',
  1,
  10,
  NOW(),
  NOW()
);

-- 添加后刷新网站 http://localhost:3000/products 即可看到
-- 详情页地址：http://localhost:3000/products/my-new-phone
--
-- 若 slug 已存在会报错，请换一个 slug 或先 DELETE FROM products WHERE slug='my-new-phone';
-- Navicat 连接请与 .env.local 中 DATABASE_URL 一致（默认库名 iphone_store）
