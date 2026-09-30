#!/bin/bash
echo "==================================================="
echo "  S.A.B.R.E. Master Initialization Sequence"
echo "==================================================="

echo "[1/3] Verifying Python and Node Environments..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "Python is not installed or not in PATH!"
        exit 1
    else
        PY_CMD="python"
    fi
else
    PY_CMD="python3"
fi

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH!"
    exit 1
fi

echo "[2/3] Booting Scalable Multi-Worker Backend Cluster (20,000 Concurrent Capacity)..."
cd backend
$PY_CMD -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4 --limit-concurrency 25000 --backlog 4096 --timeout-keep-alive 65 &
BACKEND_PID=$!
cd ..

echo "[3/3] Booting Frontend (Vite)..."
cd frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!
cd ..

echo "==================================================="
echo "S.A.B.R.E. Engine is LIVE!"
echo "Backend API: http://localhost:8000"
echo "Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to terminate both processes cleanly."
echo "==================================================="

# Exit trap
trap "echo 'Shutting down S.A.B.R.E...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM

wait
