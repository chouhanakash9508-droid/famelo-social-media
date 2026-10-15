@echo off
echo.
echo ============================================================
echo                    FAMELO API SERVER
echo ============================================================
echo Starting FRAMELO Backend Server...
echo.

cd /d "%~dp0"

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo 🔄 Activating virtual environment...
    call venv\Scripts\activate.bat
    echo.
)

REM Start the server on localhost
echo 🚀 Starting FAMELO API on http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo.
uvicorn main:app --reload --host localhost --port 8000

pause