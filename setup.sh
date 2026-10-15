#!/bin/bash

echo "========================================"
echo "   FRAMELO - Instagram Clone Setup"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python is not installed${NC}"
    echo "Please install Python 3.8+ from https://python.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and Python are installed${NC}"
echo

# Setup Backend
echo -e "${YELLOW}[1/4] Setting up Backend...${NC}"
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to create virtual environment${NC}"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install Python dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo

# Setup Frontend
echo -e "${YELLOW}[2/4] Setting up Frontend...${NC}"
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install Node.js dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo

# Create Firebase configuration reminder
echo -e "${YELLOW}[3/4] Firebase Configuration Required...${NC}"
echo
echo -e "${YELLOW}IMPORTANT: You need to configure Firebase before running the app:${NC}"
echo
echo "1. Create a Firebase project at https://console.firebase.google.com/"
echo "2. Enable Authentication (Email/Password)"
echo "3. Enable Firestore Database"
echo "4. Enable Storage"
echo "5. Get your Firebase config and update:"
echo "   - frontend/.env (Firebase web config)"
echo "   - backend/.env (Firebase admin config)"
echo "   - Download serviceAccountKey.json to backend/ folder"
echo
echo "See SETUP_GUIDE.md for detailed instructions"
echo

# Create start scripts
echo -e "${YELLOW}[4/4] Creating start scripts...${NC}"

# Create backend start script
cd ../backend
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Starting Framelo Backend..."
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
EOF
chmod +x start-backend.sh

# Create frontend start script
cd ../frontend
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Starting Framelo Frontend..."
npm run dev
EOF
chmod +x start-frontend.sh

# Create combined start script
cd ..
cat > start-app.sh << 'EOF'
#!/bin/bash
echo "========================================"
echo "   Starting Framelo Application"
echo "========================================"
echo

echo "Starting backend server..."
cd backend
./start-backend.sh &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend server..."
cd ../frontend
./start-frontend.sh &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
EOF
chmod +x start-app.sh

echo -e "${GREEN}✓ Start scripts created${NC}"
echo

echo "========================================"
echo -e "${GREEN}          Setup Complete!${NC}"
echo "========================================"
echo
echo "Next steps:"
echo "1. Configure Firebase (see SETUP_GUIDE.md)"
echo "2. Update .env files with your Firebase config"
echo "3. Run './start-app.sh' to start both servers"
echo
echo "Files created:"
echo "- backend/start-backend.sh"
echo "- frontend/start-frontend.sh"
echo "- start-app.sh (starts both)"
echo
echo "For detailed setup instructions, see SETUP_GUIDE.md"
echo