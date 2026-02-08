@echo off
echo ========================================
echo   FRONTEND DEPLOYMENT TO VERCEL
echo ========================================
echo.

echo Building production bundle...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful! Deploying to Vercel...
echo.

vercel --prod

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Please verify your deployment at the URL shown above.
echo.
pause
