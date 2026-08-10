@echo off
echo ============================================================
echo   ADVERSIQ Intelligence OS — Local Server Launcher
echo ============================================================
echo.

cd /d "%~dp0"

:: Set environment
set NODE_ENV=development
set PORT=3000
set LIDA_PORT=3001

:: Check Node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: Check dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting ADVERSIQ Backend API  [port 3000] ...
echo Starting ADVERSIQ Frontend UI  [port 5173] ...
echo.
echo Once started, open your browser to:
echo   http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop.
echo.

:: Launch backend in new terminal window
start "ADVERSIQ Backend [port 3000]" cmd /k "set NODE_ENV=development && set JWT_SECRET=adversiq-dev-secret-change-in-production-64chars-min && npx tsx server/index.ts"

:: Wait 3 seconds for backend to init
timeout /t 3 /nobreak >nul

:: Launch frontend in new terminal window  
start "ADVERSIQ Frontend [port 5173]" cmd /k "npx vite --port 5173 --host 0.0.0.0"

echo.
echo Both servers launching in separate windows.
echo Backend:  http://localhost:3000/api/health
echo Frontend: http://localhost:5173
echo.
pause
