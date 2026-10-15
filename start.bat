@echo off
echo Starting FRAMELO - Production-Ready Social Media Platform
echo.

echo Starting Backend Server...
cd backend
start "FRAMELO Backend" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd ..\frontend
start "FRAMELO Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo FRAMELO is starting up!
echo ========================================
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Demo Accounts:
echo - alice@example.com / password
echo - david@example.com / password  
echo - sarah@example.com / password
echo ========================================

pause