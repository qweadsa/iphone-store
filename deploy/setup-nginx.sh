#!/usr/bin/env bash
# 配置 Nginx，让域名 http://teumu.online 无需 :3000 端口访问
set -euo pipefail

APP_DIR="/var/www/iphone-store"
cd "$APP_DIR"

echo "==> 安装 Nginx（若未安装）"
command -v nginx >/dev/null || apt install -y nginx

echo "==> 写入 Nginx 配置（HTTP）"
cp deploy/nginx-teumu.online-http.conf /etc/nginx/sites-available/teumu.online
ln -sf /etc/nginx/sites-available/teumu.online /etc/nginx/sites-enabled/teumu.online
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> 确保网站进程在跑"
cp deploy/iphone-store.service /etc/systemd/system/iphone-store.service
systemctl daemon-reload
systemctl enable iphone-store
systemctl restart iphone-store

sleep 2
echo "==> 本机测试"
curl -s -o /dev/null -w "127.0.0.1:3000 => HTTP %{http_code}\n" http://127.0.0.1:3000 || true
curl -s -o /dev/null -w "teumu.online:80   => HTTP %{http_code}\n" -H "Host: teumu.online" http://127.0.0.1/ || true

echo ""
echo "完成！浏览器打开: http://teumu.online"
echo "HTTPS 证书稍后执行: certbot --nginx -d teumu.online -d www.teumu.online"
