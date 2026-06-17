#!/usr/bin/env bash
# 服务器上一键更新：git pull + 构建 + 重启
# 用法: sudo bash deploy/server-update.sh

set -euo pipefail

APP_DIR="/var/www/iphone-store"
cd "$APP_DIR"

echo "==> git pull"
git pull origin main

echo "==> npm ci"
npm ci

echo "==> prisma"
npx prisma generate
npx prisma db push
npx prisma db seed 2>/dev/null || true

echo "==> build"
npm run build

echo "==> restart"
cp deploy/iphone-store.service /etc/systemd/system/iphone-store.service
systemctl daemon-reload
systemctl enable iphone-store
systemctl restart iphone-store
sleep 2
systemctl status iphone-store --no-pager || true

echo "==> done"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000 || true
