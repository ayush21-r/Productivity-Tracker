@echo off
REM TimeSheet Application Start Script
REM Runs both backend and frontend servers

echo.
echo ==================================
echo   TimeSheet Application Starter
echo ==================================
echo.

REM Check if backend exists
if not exist "backend" (
    echo Error: Backend directory not found!
    pause
    exit /b 1
)

REM Check if frontend exists
if not exist "frontend" (
    echo Error: Frontend directory not found!
    pause
    exit /b 1
)

echo Starting TimeSheet Services...
echo.

REM Start backend in a new window
echo Starting Backend Server (PORT 4000)...
start "TimeSheet Backend - 4000" cmd /k "cd backend && npm run dev"

REM Wait for backend to start
timeout /t 2 /nobreak

REM Start frontend in a new window
echo Starting Frontend Server (PORT 5173)...
start "TimeSheet Frontend - 5173" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers starting...
echo.
echo Access your application at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:4000/api/health
echo.
echo Close the windows to stop the servers.
pause
