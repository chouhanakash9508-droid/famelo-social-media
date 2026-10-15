# FRAMELO Local Development Setup

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- SQLite (comes with Python)

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set environment variables (optional):**
   Create a `.env` file in the backend directory:
   ```
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///./framelo.db
   ```

6. **Run database migrations:**
   ```bash
   python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

7. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables (optional):**
   Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Testing the Application

1. **Open the app** in your browser at `http://localhost:5173`

2. **Register a new account** or login with existing credentials

3. **Explore features:**
   - View the animated feed
   - Create posts
   - Like and comment on posts
   - Follow other users
   - View profiles

## API Documentation

View the API documentation at `API_DOCUMENTATION.md` or visit `http://localhost:8000/docs` for interactive Swagger UI.

## Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check that all dependencies are installed
- Verify database file is created in backend directory

### Frontend Issues
- Ensure Node.js and npm are installed
- Check that all npm packages are installed
- Verify backend is running on port 8000

### Common Errors
- **CORS errors**: Make sure backend is running and CORS is configured
- **Authentication errors**: Check that JWT tokens are properly stored
- **Database errors**: Ensure SQLite database is properly initialized

## Development Commands

### Backend
```bash
# Run with auto-reload
uvicorn main:app --reload

# Run on specific port
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview