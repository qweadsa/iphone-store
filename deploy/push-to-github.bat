@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo 正在推送到 GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo 推送失败 — 请检查网络或开 VPN 后重试
  echo 也可在 Cursor 终端手动执行: git push origin main
) else (
  echo.
  echo 推送成功！请到服务器执行:
  echo   cd /var/www/iphone-store ^&^& git pull ^&^& bash deploy/server-update.sh
)
pause
