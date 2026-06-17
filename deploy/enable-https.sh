#!/usr/bin/env bash
# 为 teumu.online 申请免费 HTTPS 证书（Let's Encrypt）
# 用法: sudo bash deploy/enable-https.sh

set -euo pipefail

APP_DIR="/var/www/iphone-store"
cd "$APP_DIR"

echo "==> 安装 certbot"
apt update
apt install -y certbot python3-certbot-nginx

echo "==> 确保 Nginx HTTP 已配置"
bash deploy/setup-nginx.sh

echo "==> 申请证书（按提示输入邮箱，选 2 重定向到 HTTPS）"
certbot --nginx -d teumu.online -d www.teumu.online

echo "==> 同步环境变量并重启"
bash deploy/server-update.sh

echo ""
echo "完成！请用 HTTPS 访问:"
echo "  https://teumu.online"
echo "  https://teumu.online/admin/teumu-mgmt-9284"
