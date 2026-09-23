@echo off
title EcoCollect - E-Waste Collection & Recycling Platform
echo =====================================================================
echo Starting EcoCollect Platform (Backend FastAPI + Frontend Vite)
echo =====================================================================

:: Navigate to root directory
cd /d "%~dp0"

:: Check if virtual environment python exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Virtualenv python not found at backend\venv\Scripts\python.exe
    pause
    exit /b 1
)

:: Start Backend in separate window
echo Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "EcoCollect Backend API" cmd /k "cd /d "%~dp0backend" && "venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Give backend a couple seconds to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend in separate window
echo Starting Vite Frontend Server on http://localhost:5173 ...
start "EcoCollect Frontend Web" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Open default browser
timeout /t 2 /nobreak > nul
start http://localhost:5173/login

echo =====================================================================
echo Services launched successfully!
echo - Frontend: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000
echo - Swagger Docs: http://127.0.0.1:8000/docs
echo =====================================================================
