# PowerShell Deployment Script for Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FRONTEND DEPLOYMENT TO VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building production bundle..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Build successful! Deploying to Vercel..." -ForegroundColor Green
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please verify your deployment at the URL shown above." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
