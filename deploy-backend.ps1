# PowerShell Deployment Script for Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BACKEND DEPLOYMENT TO VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "ERROR: Vercel CLI not installed!" -ForegroundColor Red
    Write-Host "Please install: npm i -g vercel" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Deploying backend to production..." -ForegroundColor Green
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Copy the deployed URL and update:" -ForegroundColor Yellow
Write-Host "1. Frontend .env.production file" -ForegroundColor Yellow
Write-Host "2. Frontend Vercel environment variables" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
