@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push-and-deploy.ps1"
if errorlevel 1 (
  echo.
  echo 部署失败。若提示 Permission denied，请在服务器执行一次:
  echo   bash deploy/install-deploy-key.sh
  pause
  exit /b 1
)
pause
