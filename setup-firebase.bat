@echo off
echo.
echo ========================================
echo   FRAMELO Firebase Setup Helper
echo ========================================
echo.
echo This script will help you configure Firebase for FRAMELO.
echo.
echo First, you need to:
echo 1. Create a Firebase project at https://console.firebase.google.com/
echo 2. Enable Authentication (Email/Password)
echo 3. Create Firestore Database (test mode)
echo 4. Enable Storage (test mode)
echo 5. Get your web app configuration
echo.
pause
echo.
echo Please enter your Firebase configuration values:
echo.

set /p API_KEY="Firebase API Key: "
set /p AUTH_DOMAIN="Auth Domain (project-id.firebaseapp.com): "
set /p PROJECT_ID="Project ID: "
set /p STORAGE_BUCKET="Storage Bucket (project-id.appspot.com): "
set /p MESSAGING_SENDER_ID="Messaging Sender ID: "
set /p APP_ID="App ID: "

echo.
echo Creating .env file with your Firebase configuration...
echo.

(
echo # API Configuration
echo VITE_API_URL=http://localhost:8000
echo VITE_FIREBASE_API_KEY=%API_KEY%
echo VITE_FIREBASE_AUTH_DOMAIN=%AUTH_DOMAIN%
echo VITE_FIREBASE_PROJECT_ID=%PROJECT_ID%
echo VITE_FIREBASE_STORAGE_BUCKET=%STORAGE_BUCKET%
echo VITE_FIREBASE_MESSAGING_SENDER_ID=%MESSAGING_SENDER_ID%
echo VITE_FIREBASE_APP_ID=%APP_ID%
echo.
echo # App Configuration
echo VITE_APP_NAME=FRAMELO
echo VITE_APP_VERSION=1.0.0
echo.
echo # Development Settings
echo VITE_DEBUG=true
) > frontend\.env

echo ✅ Firebase configuration saved to frontend\.env
echo.
echo Next steps:
echo 1. cd frontend
echo 2. npm run dev
echo.
echo If you see any errors, check FIREBASE_SETUP.md for troubleshooting.
echo.
pause