@echo off
title Syncing Daily Tasks to Jzarr Bookmark
cd /d "%~dp0"
echo.
echo ========================================================
echo   Syncing tasks.json to GitHub...
echo ========================================================
echo.
git add tasks.json
git commit -m "Update daily tasks"
git push origin main
echo.
echo ========================================================
echo  ✓ SUCCESS! Naye tasks GitHub par update ho gaye hain!
echo  Ab Chrome mein "⚡ Fill Day End Report" bookmark dabayein!
echo  (Bookmark ko dobara drag karne ki koi zaroorat nahi hai)
echo ========================================================
echo.
pause
