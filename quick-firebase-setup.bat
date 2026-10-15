@echo off
echo.
echo ========================================
echo   🔥 FRAMELO Firebase Quick Setup
echo ========================================
echo.
echo STEP 1: Create Firebase Project
echo 1. Go to: https://console.firebase.google.com/
echo 2. Click "Create a project"
echo 3. Name it "framelo" or any name you prefer
echo.
echo STEP 2: Enable Services
echo 1. Enable Authentication (Email/Password)
echo 2. Create Firestore Database (test mode)
echo 3. Enable Storage (test mode)
echo.
echo STEP 3: Get Web App Config
echo 1. Go to Project Settings (gear icon)
echo 2. Click "Web app" icon
echo 3. Register app as "framelo-web"
echo 4. Copy the config object
echo.
pause
echo.
echo Now enter your Firebase config values:
echo.

set /p API_KEY="API Key: "
set /p AUTH_DOMAIN="Auth Domain: "
set /p PROJECT_ID="Project ID: "
set /p STORAGE_BUCKET="Storage Bucket: "
set /p MESSAGING_SENDER_ID="Messaging Sender ID: "
set /p APP_ID="App ID: "

echo.
echo Updating .env file...

(
echo # API Configuration
echo VITE_API_URL=http://localhost:8000
echo.
echo # Firebase Configuration
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

echo.
echo ✅ Firebase configuration updated!
echo.
echo Next steps:
echo 1. cd frontend
echo 2. npm run dev
echo.
echo Your app should now work with Firebase!
echo.
pause