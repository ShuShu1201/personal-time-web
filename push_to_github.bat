@echo off
chcp 65001 > nul
title ChronoCraft 自動推送到 GitHub
echo ================================================================
echo   🎓 AIoT-DA Class 1 ｜ 許嘉修的個人專屬時間主頁 自動發佈小工具
echo ================================================================
echo.

cd /d "%~dp0"

:: 檢查 Git 是否安裝
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 Git！請確認電腦已安裝 Git。
    pause
    exit /b
)

:: 1. 檢查並初始化 Git
if not exist ".git" (
    echo [步驟 1/3] 初始化本機 Git 儲存庫...
    git init
    git branch -M main
) else (
    echo [步驟 1/3] 本機 Git 儲存庫已就緒...
)

:: 2. 加入所有檔案並 Commit
echo.
echo [步驟 2/3] 加入檔案並打包提交 (git commit)...
git add .
git commit -m "Auto deploy: update 許嘉修's ChronoCraft personal website"

:: 3. 檢查或設定 Remote 網址
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo 尚未連結您的 GitHub 儲存庫！
    echo 請前往 https://github.com/new 建立倉庫（如 personal-time-web）
    echo.
    set /p repo_url="請貼上您的 GitHub 倉庫網址 (例: https://github.com/your-name/personal-time-web.git): "
    git remote add origin %repo_url%
)

:: 4. 推送到 GitHub
echo.
echo [步驟 3/3] 正在推送到 GitHub main 分支...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo   🎉 發佈成功！
    echo   GitHub Actions 已自動啟動，幾秒鐘後即可透過 GitHub Pages 瀏覽！
    echo ================================================================
) else (
    echo.
    echo [提示] 若推送失敗，請確認您已登入 GitHub 帳號並具備該儲存庫權限。
)

echo.
pause
