@echo off
chcp 65001 >nul
setlocal

if "%~1"=="" (
  echo 用法: deploy\git-push.bat 仓库HTTPS地址
  echo 示例: deploy\git-push.bat https://gitee.com/qweadsa/iphone-store.git
  exit /b 1
)

cd /d "%~dp0.."
set URL=%~1

git remote remove origin 2>nul
git remote add origin "%URL%"
git branch -M main 2>nul
git push -u origin main
if errorlevel 1 git push -u origin master

pause
