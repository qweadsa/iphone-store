#!/usr/bin/env bash
# 修复后台图片上传（权限 + Nginx 静态目录）
set -euo pipefail
cd /var/www/iphone-store

mkdir -p public/uploads public/payments
chown -R www-data:www-data public/uploads public/payments
chmod -R 775 public/uploads public/payments

if [ -f /etc/letsencrypt/live/teumu.online/fullchain.pem ]; then
  cp deploy/nginx-teumu.online.conf /etc/nginx/sites-available/teumu.online
else
  cp deploy/nginx-teumu.online-http.conf /etc/nginx/sites-available/teumu.online
fi
ln -sf /etc/nginx/sites-available/teumu.online /etc/nginx/sites-enabled/teumu.online
nginx -t && systemctl restart nginx

cp deploy/iphone-store.service /etc/systemd/system/iphone-store.service
systemctl daemon-reload
systemctl restart iphone-store

echo "完成。请重新上传图片，并点击「保存此礼品」。"
