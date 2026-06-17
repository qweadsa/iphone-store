#!/usr/bin/env bash
# Ubuntu 22.04 / 24.04 一键准备环境（在服务器上以 root 或 sudo 运行）
# 用法: sudo bash deploy/setup-ubuntu.sh

set -euo pipefail

APP_DIR="/var/www/iphone-store"
DOMAIN="${1:-}"

echo "==> 更新系统"
apt update && apt upgrade -y

echo "==> 安装基础依赖"
apt install -y curl git nginx mysql-server certbot python3-certbot-nginx ufw

echo "==> 安装 Node.js 20 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node -v
npm -v

echo "==> 防火墙（仅开放 SSH + HTTP/HTTPS）"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> MySQL 安全提示"
echo "    请手动执行: sudo mysql_secure_installation"
echo "    然后创建数据库:"
echo ""
echo "    sudo mysql -e \"CREATE DATABASE iphone_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
echo "    sudo mysql -e \"CREATE USER 'iphone_app'@'localhost' IDENTIFIED BY '你的强密码';\""
echo "    sudo mysql -e \"GRANT ALL PRIVILEGES ON iphone_store.* TO 'iphone_app'@'localhost';\""
echo "    sudo mysql -e \"FLUSH PRIVILEGES;\""
echo ""

echo "==> 应用目录"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/public/payments"
mkdir -p "$APP_DIR/public/prizes"
chown -R www-data:www-data "$APP_DIR"

echo "==> Nginx 站点配置"
if [ -f "$APP_DIR/deploy/nginx-site.conf" ]; then
  cp "$APP_DIR/deploy/nginx-site.conf" /etc/nginx/sites-available/iphone-store
  ln -sf /etc/nginx/sites-available/iphone-store /etc/nginx/sites-enabled/iphone-store
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

echo "==> Systemd 服务"
if [ -f "$APP_DIR/deploy/iphone-store.service" ]; then
  cp "$APP_DIR/deploy/iphone-store.service" /etc/systemd/system/iphone-store.service
  systemctl daemon-reload
  systemctl enable iphone-store
fi

if [ -n "$DOMAIN" ]; then
  echo "==> 申请 Let's Encrypt 证书: $DOMAIN"
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || true
fi

echo ""
echo "============================================"
echo " 环境准备完成。接下来请："
echo " 1. 把代码放到 $APP_DIR（git clone 或 rsync）"
echo " 2. cp deploy/env.production.example .env 并填写"
echo " 3. npm ci && npm run build && npx prisma db push && npx prisma db seed"
echo " 4. chown -R www-data:www-data $APP_DIR"
echo " 5. sudo systemctl start iphone-store"
echo " 6. 域名 DNS 指向本机公网 IP 后: sudo certbot --nginx -d 你的域名.com"
echo "============================================"
