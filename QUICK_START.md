# FRAMELO - Quick Start Guide

## 🚀 How to Run the Application

### Step 1: Start the Backend Server
1. Open Command Prompt or PowerShell
2. Navigate to the backend folder:
   ```
   cd "C:\Users\AKASH CHOUHAN\OneDrive\Documents\Desktop\FRAMELO\backend"
   ```
3. Run the server:
   ```
   python -m uvicorn main_minimal:app --host 127.0.0.1 --port 8000 --reload
   ```
   
   OR simply double-click: `start_server.bat`

### Step 2: Start the Frontend
1. Open a NEW Command Prompt or PowerShell window
2. Navigate to the frontend folder:
   ```
   cd "C:\Users\AKASH CHOUHAN\OneDrive\Documents\Desktop\FRAMELO\frontend"
   ```
3. Install dependencies (first time only):
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
   
   OR simply double-click: `start_frontend.bat`

### Step 3: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## ✅ What Should Happen
1. Backend server starts on port 8000
2. Frontend development server starts on port 5173
3. Your browser should automatically open to http://localhost:5173
4. You should see the FRAMELO social media platform

## 🔧 Troubleshooting
- If port 8000 is busy, the backend will automatically use the next available port
- If port 5173 is busy, Vite will ask if you want to use a different port
- Make sure both servers are running before using the application

## 📱 Features Available
- ✅ Modern UI with smooth animations
- ✅ Home feed with infinite scroll
- ✅ Create post flow with drag & drop
- ✅ Discover page with visual grid
- ✅ Profile pages with post grids
- ✅ Mobile-responsive design
- ✅ Production-ready polish

The application is now ready to use with all the visual-first, smooth interactions implemented!