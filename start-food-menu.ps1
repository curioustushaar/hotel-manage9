# Quick Start Script for Food Menu Module
# Run this script to start both backend and frontend servers

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Bareena Atithi - Food Menu Module" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($null -eq $mongoProcess) {
    Write-Host "❌ MongoDB is not running!" -ForegroundColor Red
    Write-Host "Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "  Option 1: Run 'mongod' in a terminal" -ForegroundColor White
    Write-Host "  Option 2: Start MongoDB service" -ForegroundColor White
    Write-Host ""
    $startMongo = Read-Host "Would you like to start MongoDB now? (y/n)"
    if ($startMongo -eq "y") {
        Start-Process "mongod" -WindowStyle Normal
        Write-Host "✅ MongoDB starting..." -ForegroundColor Green
        Start-Sleep -Seconds 3
    } else {
        Write-Host "Please start MongoDB and run this script again." -ForegroundColor Yellow
        exit
    }
} else {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
}

Write-Host ""

# Check if backend dependencies are installed
if (-Not (Test-Path ".\backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location ".\backend"
    npm install
    Set-Location ".."
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".\backend\.env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".\backend\.env.example" ".\backend\.env"
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Start backend server in new window
Write-Host "🚀 Starting Backend Server (Port 5000)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

Start-Sleep -Seconds 2

# Start frontend server in new window
Write-Host "🚀 Starting Frontend Server (Port 5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Food Menu: http://localhost:5173/admin/food-menu" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open Food Menu in browser..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173/admin/food-menu"

Write-Host ""
Write-Host "✨ Happy Managing! ✨" -ForegroundColor Green
