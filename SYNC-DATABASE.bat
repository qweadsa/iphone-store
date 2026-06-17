@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ========================================
echo   iPhone Store - 数据库同步（Navicat）
echo  ========================================
echo.
echo  请确认 Navicat 里 MySQL 已启动，且 .env.local 中
echo  DATABASE_URL 指向你的数据库（默认 iphone_store）
echo.
call npx prisma db push
if errorlevel 1 (
  echo.
  echo  [失败] 无法连接数据库，请检查 .env.local 里的 DATABASE_URL
  pause
  exit /b 1
)
call npx prisma generate
echo.
node scripts/check-db.mjs
echo.
echo  在 Navicat 新增产品可参考: scripts\navicat-add-product.sql
echo.
pause
