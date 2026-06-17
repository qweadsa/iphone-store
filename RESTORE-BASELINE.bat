@echo off
chcp 65001 >nul
echo.
echo  回退到「改版前基线」版本
echo  ─────────────────────────────
echo  方式 1 - Git 标签（推荐，在本项目目录执行）:
echo    git checkout before-ui-redesign
echo    或: git reset --hard before-ui-redesign
echo.
echo  方式 2 - 完整文件夹备份:
echo    C:\Users\Administrator\Projects\iphone-store-backup-before-ui
echo    复制该文件夹覆盖当前项目即可
echo.
echo  当前基线提交: before-ui-redesign
echo  保存时间: 改版前端之前
echo.
pause
