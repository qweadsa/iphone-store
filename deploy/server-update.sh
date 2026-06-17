#!/usr/bin/env bash
# 服务器上一键更新：git pull + 同步后台密码 + 构建 + 重启
# 用法: sudo bash deploy/server-update.sh

set -euo pipefail

APP_DIR="/var/www/iphone-store"
cd "$APP_DIR"

merge_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"
  python3 - "$key" "$value" "$file" <<'PY'
import sys
key, value, path = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
except FileNotFoundError:
    lines = []
out = []
found = False
prefix = key + "="
for line in lines:
    if line.startswith(prefix):
        out.append(f"{key}={value}\n")
        found = True
    else:
        out.append(line)
if not found:
    out.append(f"{key}={value}\n")
with open(path, "w", encoding="utf-8") as f:
    f.writelines(out)
PY
}

echo "==> git pull"
git pull origin main

echo "==> sync .env (admin login)"
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ] && [ -f "deploy/env.teumu.online.example" ]; then
  cp deploy/env.teumu.online.example "$ENV_FILE"
  echo "    created .env from template — 请确认 DATABASE_URL 和 SESSION_SECRET"
fi
if [ -f "deploy/admin-credentials.env" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(echo "$line" | xargs)"
    [ -z "$line" ] && continue
    key="${line%%=*}"
    value="${line#*=}"
    [ -z "$key" ] || [ -z "$value" ] && continue
    merge_env_var "$key" "$value" "$ENV_FILE"
    echo "    $key=***"
  done < "deploy/admin-credentials.env"
fi

echo "==> npm ci"
npm ci

echo "==> prisma"
npx prisma generate
npx prisma db push
# 不自动 seed：避免每次更新覆盖你在后台改过的奖品/配置
# 仅首次空库需要时手动执行: npx prisma db seed

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
echo "    Admin login: https://teumu.online/admin/teumu-mgmt-9284"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000 || true
