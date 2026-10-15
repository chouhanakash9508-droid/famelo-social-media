@echo off
echo ========================================
echo    FRAMELO - Instagram Clone Setup
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
)

echo ✓ Node.js and Python are installed
echo.

:: Setup Backend
echo [1/4] Setting up Backend...
cd backend

:: Create virtual environment
echo Creating Python virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo ✓ Backend setup complete
echo.

:: Setup Frontend
echo [2/4] Setting up Frontend...
cd ..\frontend

:: Install Node.js dependencies
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo ✓ Frontend setup complete
echo.

:: Create Firebase configuration reminder
echo [3/4] Firebase Configuration Required...
echo.
echo IMPORTANT: You need to configure Firebase before running the app:
echo.
echo 1. Create a Firebase project at https://console.firebase.google.com/
echo 2. Enable Authentication (Email/Password)
echo 3. Enable Firestore Database
echo 4. Enable Storage
echo 5. Get your Firebase config and update:
echo    - frontend/.env (Firebase web config)
echo    - backend/.env (Firebase admin config)
echo    - Download serviceAccountKey.json to backend/ folder
echo.
echo See SETUP_GUIDE.md for detailed instructions
echo.

:: Create start scripts
echo [4/4] Creating start scripts...

:: Create backend start script
cd ..\backend
echo @echo off > start-backend.bat
echo echo Starting Framelo Backend... >> start-backend.bat
echo call venv\Scripts\activate.bat >> start-backend.bat
echo uvicorn main:app --reload --host 0.0.0.0 --port 8000 >> start-backend.bat

:: Create frontend start script
cd ..\frontend
echo @echo off > start-frontend.bat
echo echo Starting Framelo Frontend... >> start-frontend.bat
echo npm run dev >> start-frontend.bat

:: Create combined start script
cd ..
echo @echo off > start-app.bat
echo echo ======================================== >> start-app.bat
echo echo    Starting Framelo Application >> start-app.bat
echo echo ======================================== >> start-app.bat
echo echo. >> start-app.bat
echo echo Starting backend server... >> start-app.bat
echo start "Framelo Backend" cmd /k "cd backend && call start-backend.bat" >> start-app.bat
echo timeout /t 3 /nobreak ^>nul >> start-app.bat
echo echo Starting frontend server... >> start-app.bat
echo start "Framelo Frontend" cmd /k "cd frontend && call start-frontend.bat" >> start-app.bat
echo echo. >> start-app.bat
echo echo Both servers are starting... >> start-app.bat
echo echo Backend: http://localhost:8000 >> start-app.bat
echo echo Frontend: http://localhost:5173 >> start-app.bat
echo echo. >> start-app.bat
echo echo Press any key to exit... >> start-app.bat
echo pause ^>nul >> start-app.bat

echo ✓ Start scripts created
echo.

echo ========================================
echo           Setup Complete! 
echo ========================================
echo.
echo Next steps:
echo 1. Configure Firebase (see SETUP_GUIDE.md)
echo 2. Update .env files with your Firebase config
echo 3. Run 'start-app.bat' to start both servers
echo.
echo Files created:
echo - backend/start-backend.bat
echo - frontend/start-frontend.bat  
echo - start-app.bat (starts both)
echo.
echo For detailed setup instructions, see SETUP_GUIDE.md
echo.
pause