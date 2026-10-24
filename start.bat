@echo off
title FlowCode — Source Code to Flowchart Generator
color 0b

echo ========================================================
echo   FlowCode - Source Code to Flowchart Generator
echo   Compiler Design Laboratory Course Project
echo ========================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "FlowCode Backend" /min cmd /c "cd /d "%~dp0backend" && npm start"

echo [2/3] Starting Frontend Vite Server (Port 5173)...
start "FlowCode Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Launching FlowCode in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo   FlowCode is now live at: http://localhost:5173
echo   Backend REST API is at:  http://localhost:5000
echo ========================================================
echo.
pause
