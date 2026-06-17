@echo off
chcp 65001 >nul
setlocal

REM 在本机 Windows 双击运行，生成小体积 zip（不含 node_modules / .next）
REM 生成: deploy\iphone-store-upload.zip

cd /d "%~dp0.."
set STAGING=deploy\_pack_staging
set ZIP=deploy\iphone-store-upload.zip

if exist "%STAGING%" rmdir /s /q "%STAGING%"
if exist "%ZIP%" del /f "%ZIP%"
mkdir "%STAGING%"

echo.
echo [1/3] 复制项目文件（跳过 node_modules、.next、.git）...

robocopy . "%STAGING%" /E /XD node_modules .next .git out build coverage .cursor deploy\_pack_staging /XF .env .env.local .env.*.local *.log /NFL /NDL /NJH /NJS /nc /ns /np
if errorlevel 8 (
  echo 复制失败
  exit /b 1
)

echo [2/3] 压缩 zip...
powershell -NoProfile -Command "Compress-Archive -Path '%STAGING%\*' -DestinationPath '%ZIP%' -Force"

echo [3/3] 清理临时目录...
rmdir /s /q "%STAGING%"

for %%A in ("%ZIP%") do set SIZE=%%~zA
echo.
echo ========================================
echo  打包完成: %ZIP%
echo  大小约: %SIZE% 字节（通常几十 MB 以内）
echo ========================================
echo.
echo 上传到服务器:
echo   scp deploy\iphone-store-upload.zip root@160.30.4.98:/tmp/
echo.
echo 在服务器解压并安装:
echo   apt install -y unzip
echo   mkdir -p /var/www/iphone-store
echo   unzip -o /tmp/iphone-store-upload.zip -d /var/www/iphone-store
echo   cd /var/www/iphone-store
echo   npm ci
echo   npm run build
echo   npx prisma db push
echo.
pause
