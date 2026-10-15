# Framelo - Instagram Clone Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Firebase Account
- Git

## 📱 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `framelo-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Services

#### Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. Save changes

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in "test mode" (for development)
4. Choose location closest to your users
5. Create database

#### Storage
1. Go to Storage
2. Click "Get started"
3. Start in "test mode"
4. Choose same location as Firestore
5. Done

### 3. Get Firebase Configuration

#### For Frontend (Web App)
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app
4. Register app with nickname: "Framelo Web"
5. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

#### For Backend (Admin SDK)
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `serviceAccountKey.json`
5. Place it in the `backend/` directory

## 🔧 Installation

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   Update `backend/.env` with your Firebase credentials:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   # Add other Firebase config values
   ```

5. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Update `frontend/.env` with your Firebase config:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔐 Firebase Security Rules

### Firestore Rules
Replace the default rules in Firestore with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for profiles
    }
    
    // Posts are readable by authenticated users, writable by owner
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Comments are readable by authenticated users, writable by owner
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Likes are readable by authenticated users, writable by owner
    match /likes/{likeId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Follows are readable by authenticated users, writable by follower
    match /follows/{followId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth != null && request.auth.uid == request.resource.data.followerId;
    }
    
    // Notifications are readable/writable by the target user
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.toUserId;
    }
  }
}
```

### Storage Rules
Replace the default rules in Storage with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profile-pictures/{userId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Post media
    match /posts/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Running the Application

1. **Start Backend Server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   Backend will be available at: http://localhost:8000

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be available at: http://localhost:5173

3. **Access the Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📱 Features Included

### ✅ Authentication
- Email/Password signup and login
- Firebase Authentication integration
- Protected routes
- User session management

### ✅ Posts & Feed
- Create posts with images/videos
- Infinite scroll feed
- Like and save posts
- Comments system
- Real-time updates

### ✅ User Profiles
- View user profiles
- Follow/unfollow users
- Edit profile information
- Posts grid view

### ✅ Search & Explore
- Search users by username
- Explore posts grid
- Trending content

### ✅ Real-time Features
- WebSocket connections
- Live notifications
- Typing indicators
- Real-time likes/comments

### ✅ Mobile Experience
- Responsive design
- Touch-optimized interactions
- Bottom navigation
- Swipe gestures

## 🔧 Development

### Project Structure
```
FRAMELO/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Route components
│   │   ├── context/       # React contexts
│   │   ├── services/      # API services
│   │   └── config/        # Configuration files
│   └── public/            # Static assets
├── backend/
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment variables
└── docs/                # Documentation
```

### Adding New Features

1. **Frontend Components:**
   - Create in `frontend/src/components/`
   - Follow existing naming conventions
   - Use TypeScript for better development experience

2. **Backend Endpoints:**
   - Add to `backend/main.py`
   - Follow RESTful conventions
   - Include proper error handling

3. **Database Collections:**
   - Design schema in Firestore
   - Update security rules
   - Add to service files

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform
4. Configure custom domain (optional)

### Backend (Railway/Heroku/DigitalOcean)
1. Create `Dockerfile` for containerization
2. Set up environment variables
3. Deploy with your preferred platform
4. Configure custom domain (optional)

### Firebase (Production)
1. Upgrade to Blaze plan for production usage
2. Update security rules for production
3. Set up proper authentication domains
4. Configure storage quotas and limits

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Connection Error:**
   - Check API keys in `.env` files
   - Verify Firebase project configuration
   - Ensure services are enabled in Firebase Console

2. **CORS Issues:**
   - Update CORS origins in backend
   - Check frontend API URL configuration
   - Verify Firebase domain settings

3. **Authentication Problems:**
   - Check Firebase Auth configuration
   - Verify JWT token handling
   - Ensure proper error handling

4. **File Upload Issues:**
   - Check Firebase Storage rules
   - Verify file size limits
   - Ensure proper MIME type handling

### Getting Help

- Check Firebase Console for error logs
- Review browser console for frontend errors
- Check backend logs for API issues
- Verify all environment variables are set

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, FastAPI, and Firebase**

*A complete Instagram-like social media platform with real-time features and modern UI/UX*