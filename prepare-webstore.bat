@echo off
echo ============================================
echo   LockedIn - Chrome Web Store Preparation
echo ============================================
echo.

echo [1/3] Building extension...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [2/3] Creating ZIP package...
cd dist
if exist ..\lockedin-webstore.zip del ..\lockedin-webstore.zip
powershell Compress-Archive -Path * -DestinationPath ..\lockedin-webstore.zip -Force
cd ..
echo ZIP package created: lockedin-webstore.zip
echo.

echo [3/3] Deployment checklist:
echo.
echo BEFORE UPLOADING TO CHROME WEB STORE:
echo [ ] Host privacy policy at a public URL
echo [ ] Create at least 1 screenshot (1280x800 or 640x400)
echo [ ] Verify OAuth client ID in Google Cloud Console
echo [ ] Review CHROME_WEBSTORE_CHECKLIST.md
echo.
echo ============================================
echo   Package ready: lockedin-webstore.zip
echo ============================================
echo.
echo Next steps:
echo 1. Upload lockedin-webstore.zip to Chrome Web Store
echo 2. See CHROME_WEBSTORE_CHECKLIST.md for details
echo.
pause

