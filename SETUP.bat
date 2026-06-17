@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ========================================
echo   iPhone Store 一键配置
echo  ========================================
echo.

echo [1/2] 配置数据库...
call npm run setup:db
if errorlevel 1 (
  echo.
  echo  数据库未连接 — 网站仍可用默认数据启动
  echo  请在 Navicat 启动 MySQL 后重新运行此脚本
  echo.
)

echo.
echo [2/2] 启动网站...
call npm run dev
pause
