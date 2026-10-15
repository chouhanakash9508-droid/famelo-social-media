@echo off
echo Starting FRAMELO Backend Server...
cd /d "%~dp0"
python -m uvicorn main_minimal:app --host 127.0.0.1 --port 8000 --reload
pause