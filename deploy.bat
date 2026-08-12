@echo off
echo ===================================================
echo   AWC IIT ROPAR -- Automatic Deploy to GitHub Pages
echo ===================================================
echo.

git add -A
git commit -m "Updated website features & content"
git push origin main

echo.
echo ===================================================
echo   Success! Your website updates are pushing to GitHub.
echo ===================================================
pause
