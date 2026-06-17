-- =============================================
-- iPhone Store 数据库初始化（与 Prisma 表结构一致）
-- 在 Navicat：连接 localhost:3306 → 查询 → 粘贴全部 → 运行
-- =============================================

CREATE DATABASE IF NOT EXISTS iphone_store
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE iphone_store;

CREATE TABLE IF NOT EXISTS products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  name            VARCHAR(200) NOT NULL,
  tagline         VARCHAR(500) NOT NULL DEFAULT '',
  description     TEXT NOT NULL,
  category        VARCHAR(20) NOT NULL,
  badge           VARCHAR(20) DEFAULT NULL,
  imageUrl        VARCHAR(500) DEFAULT NULL,
  storageOptions  JSON NOT NULL,
  colors          JSON NOT NULL,
  features        JSON NOT NULL,
  seoTitle        VARCHAR(300) DEFAULT NULL,
  seoDescription  TEXT DEFAULT NULL,
  active          TINYINT(1) NOT NULL DEFAULT 1,
  sortOrder       INT NOT NULL DEFAULT 0,
  createdAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blind_box_prizes (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  prize_type        VARCHAR(50) NOT NULL,
  subtitle          VARCHAR(200) DEFAULT NULL,
  tier              VARCHAR(20) NOT NULL DEFAULT 'rare',
  fulfillment_type  VARCHAR(20) NOT NULL DEFAULT 'none',
  weight            INT NOT NULL,
  emoji             VARCHAR(10) NOT NULL DEFAULT '🎁',
  image_url         VARCHAR(500) DEFAULT NULL,
  drawable          TINYINT(1) NOT NULL DEFAULT 1,
  show_in_pool      TINYINT(1) NOT NULL DEFAULT 1,
  active            TINYINT(1) NOT NULL DEFAULT 1,
  sort_order        INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blind_box_config (
  id                      INT PRIMARY KEY DEFAULT 1,
  price                   DOUBLE NOT NULL DEFAULT 59,
  enabled                 TINYINT(1) NOT NULL DEFAULT 1,
  grand_prize_name        VARCHAR(200) NOT NULL DEFAULT 'iPhone 17 Pro Max',
  grand_prize_value       VARCHAR(50) NOT NULL DEFAULT '$1,199',
  hero_title              VARCHAR(300) DEFAULT NULL,
  hero_subtitle           TEXT DEFAULT NULL,
  grand_prize_image_url   VARCHAR(500) DEFAULT NULL,
  seo_title               VARCHAR(300) DEFAULT NULL,
  seo_description         TEXT DEFAULT NULL,
  daily_limit             INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
  id                    INT PRIMARY KEY DEFAULT 1,
  home_seo_title        VARCHAR(300) DEFAULT NULL,
  home_seo_description  TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(30) NOT NULL UNIQUE,
  customer_name   VARCHAR(100) NOT NULL,
  email           VARCHAR(200) NOT NULL,
  phone           VARCHAR(50) DEFAULT NULL,
  address         TEXT NOT NULL,
  city            VARCHAR(100) NOT NULL DEFAULT '',
  state           VARCHAR(50) NOT NULL DEFAULT '',
  zip             VARCHAR(20) NOT NULL DEFAULT '',
  total           DOUBLE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  VARCHAR(100) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  color       VARCHAR(100) NOT NULL,
  storage     VARCHAR(50) NOT NULL,
  price       DOUBLE NOT NULL,
  quantity    INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始数据
INSERT INTO blind_box_config (id, price, enabled, grand_prize_name, grand_prize_value, hero_title, hero_subtitle, seo_title, seo_description)
VALUES (
  1, 59, 1, 'iPhone 17 Pro Max', 'RM5,999',
  'Win an iPhone 17 Pro Max',
  'Just RM59 for one chance at the grand prize!',
  'iPhone Mystery Box — Win iPhone 17 Pro Max for RM59',
  'Try the RM59 iPhone Mystery Box. Win an iPhone 17 Pro Max worth RM5,999.'
) ON DUPLICATE KEY UPDATE price = VALUES(price);

INSERT INTO blind_box_prizes (prize_type, name, weight, emoji, sort_order) VALUES
  ('grand',  'iPhone 17 Pro Max',       1,   '📱', 1),
  ('credit', 'RM50 Store Credit',        10,  '💰', 2),
  ('case',   'Premium Phone Case',      20,  '📦', 3),
  ('coupon', '20% Off Coupon',          25,  '🎟️', 4),
  ('retry',  'Better Luck Next Time',  944,  '🍀', 5);

INSERT INTO products (slug, name, tagline, description, category, badge, imageUrl, storageOptions, colors, features, sortOrder) VALUES
(
  'iphone-17-pro-max', 'iPhone 17 Pro Max',
  'The most powerful iPhone ever.',
  '6.9-inch Super Retina XDR display, A19 Pro chip.',
  'phone', 'new', '/products/iphone-17-pro-max.png',
  '[{"size":"256GB","price":1199},{"size":"512GB","price":1399}]',
  '[{"name":"Black Titanium","hex":"#3C3C3D"},{"name":"Natural Titanium","hex":"#BFA48F"}]',
  '["A19 Pro chip","6.9-inch display","5x optical zoom"]',
  1
),
(
  'iphone-17-pro', 'iPhone 17 Pro',
  'Pro power. Pocket size.',
  '6.3-inch Super Retina XDR display, A19 Pro chip.',
  'phone', 'new', '/products/iphone-17-pro.png',
  '[{"size":"128GB","price":999},{"size":"256GB","price":1099}]',
  '[{"name":"Black Titanium","hex":"#3C3C3D"},{"name":"Natural Titanium","hex":"#BFA48F"}]',
  '["A19 Pro chip","6.3-inch display"]',
  2
),
(
  'iphone-17', 'iPhone 17',
  'Camera Control. In your hand.',
  '6.1-inch display, A19 chip.',
  'phone', 'hot', '/products/iphone-17.png',
  '[{"size":"128GB","price":799},{"size":"256GB","price":899}]',
  '[{"name":"Ultramarine","hex":"#4A6FA5"},{"name":"Black","hex":"#1D1D1F"}]',
  '["A19 chip","Camera Control"]',
  3
)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ── 扩展表（与 prisma/schema.prisma 同步）──

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  balance       DOUBLE NOT NULL DEFAULT 0,
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  payment_id  VARCHAR(40) NOT NULL UNIQUE,
  user_id     INT DEFAULT NULL,
  email       VARCHAR(200) DEFAULT NULL,
  amount      DOUBLE NOT NULL,
  currency    VARCHAR(3) NOT NULL DEFAULT 'USD',
  method      VARCHAR(20) NOT NULL DEFAULT 'pending',
  provider    VARCHAR(20) NOT NULL DEFAULT 'internal',
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  purpose     VARCHAR(30) NOT NULL,
  metadata    JSON DEFAULT NULL,
  external_id VARCHAR(100) DEFAULT NULL,
  pay_url     TEXT DEFAULT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  amount      DOUBLE NOT NULL,
  type        VARCHAR(20) NOT NULL,
  payment_id  VARCHAR(40) DEFAULT NULL,
  description VARCHAR(300) NOT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blind_box_draws (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT DEFAULT NULL,
  email      VARCHAR(200) DEFAULT NULL,
  prize_type VARCHAR(20) NOT NULL,
  prize_name VARCHAR(200) NOT NULL,
  payment_id VARCHAR(40) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE blind_box_config
  ADD COLUMN IF NOT EXISTS winners_demo_mode TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE blind_box_config
  ADD COLUMN IF NOT EXISTS demo_winners_json JSON DEFAULT NULL;

ALTER TABLE blind_box_config
  ADD COLUMN IF NOT EXISTS stats_demo_mode TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS display_players_today INT NOT NULL DEFAULT 128,
  ADD COLUMN IF NOT EXISTS display_winners_today INT NOT NULL DEFAULT 42;

ALTER TABLE blind_box_prizes
  MODIFY COLUMN prize_type VARCHAR(50) NOT NULL,
  ADD COLUMN IF NOT EXISTS subtitle VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tier VARCHAR(20) NOT NULL DEFAULT 'rare',
  ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS drawable TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS show_in_pool TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS display_odds VARCHAR(30) DEFAULT NULL;

ALTER TABLE blind_box_draws
  ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS allow_public_display TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE blind_box_draws
  ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS credit_amount DOUBLE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS credit_applied TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claim_name VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_phone VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_email VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_address TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_city VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_state VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_zip VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claimed_at DATETIME(3) DEFAULT NULL;

ALTER TABLE blind_box_draws
  MODIFY COLUMN prize_type VARCHAR(50) NOT NULL;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS paypal_me VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS venmo_username VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS zelle_contact VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS receive_link VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS receive_note TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_require_admin_confirm TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS support_telegram_url VARCHAR(500) DEFAULT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_id VARCHAR(40) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS site_visits (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  visitor_hash  VARCHAR(64) NOT NULL,
  path          VARCHAR(500) NOT NULL,
  referrer      VARCHAR(500) DEFAULT NULL,
  user_agent    VARCHAR(500) DEFAULT NULL,
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_site_visits_created_at (created_at),
  INDEX idx_site_visits_visitor_created (visitor_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS live_count_started_at DATETIME(3) DEFAULT NULL;
