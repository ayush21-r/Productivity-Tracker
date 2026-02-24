# TimeSheet Application Start Script
# Runs both backend and frontend servers

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  TimeSheet Application Starter" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = ".\backend"
$frontendPath = ".\frontend"

# Check if backend and frontend directories exist
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting TimeSheet Services..." -ForegroundColor Green
Write-Host ""

# Start backend in a new window
Write-Host "📦 Backend Server (PORT 4000)" -ForegroundColor Yellow
Write-Host "   Starting... press Ctrl+C to stop all services" -ForegroundColor Gray
$backendProc = Start-Process powershell -ArgumentList "-NoExit -Command `"cd $backendPath; npm run dev`"" -PassThru -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "📦 Frontend Server (PORT 5173)" -ForegroundColor Yellow
Write-Host "   Starting... press Ctrl+C to stop all services" -ForegroundColor Gray
$frontendProc = Start-Process powershell -ArgumentList "-NoExit -Command `"cd $frontendPath; npm run dev`"" -PassThru -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access your application at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:4000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Close these windows to stop the servers" -ForegroundColor Yellow
