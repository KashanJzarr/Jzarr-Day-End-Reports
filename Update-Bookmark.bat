@echo off
title Update Jzarr Bookmark
cd /d "%~dp0"
node generate-bookmarklet.js
echo.
echo ========================================================
echo  ✓ Bookmark-Setup.html updated successfully!
echo  Bookmark-Setup.html ko open karke naya bookmark drag karein.
echo ========================================================
echo.
pause
