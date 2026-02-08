@echo off
echo ========================================
echo   BACKEND DEPLOYMENT TO VERCEL
echo ========================================
echo.

cd backend

echo Checking Vercel CLI...
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Vercel CLI not installed!
    echo Please install: npm i -g vercel
    pause
    exit /b 1
)

echo.
echo Deploying backend to production...
echo.

vercel --prod

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo IMPORTANT: Copy the deployed URL and update:
echo 1. Frontend .env.production file
echo 2. Frontend Vercel environment variables
echo.
pause
