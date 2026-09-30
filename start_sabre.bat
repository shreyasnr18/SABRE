@echo off
echo ===================================================
echo   S.A.B.R.E. Master Initialization Sequence
echo ===================================================

echo [1/3] Verifying Python and Node Environments...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH!
    exit /b 1
)

echo [2/3] Booting Enterprise Multi-Worker Backend (FastAPI + Uvicorn: 20,000 Concurrent Capacity)...
cd backend
start "SABRE Backend Cluster" cmd /c "python -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4 --limit-concurrency 25000 --backlog 512 --timeout-keep-alive 65"
cd ..

echo [3/3] Booting Frontend (Vite)...
cd frontend
start "SABRE Frontend" cmd /c "npm run dev -- --port 5173"
cd ..

echo ===================================================
echo S.A.B.R.E. Engine is LIVE!
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:5173
echo Close the newly opened terminal windows to exit.
echo ===================================================
