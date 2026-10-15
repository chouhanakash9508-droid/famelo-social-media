#!/bin/bash

# FAMELO Production Deployment Script

set -e

echo "🚀 Starting FAMELO Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v firebase &> /dev/null; then
        echo -e "${YELLOW}⚠️  Firebase CLI not found. Installing...${NC}"
        npm install -g firebase-tools
    fi
    
    echo -e "${GREEN}✅ All dependencies are installed${NC}"
}

# Build frontend
build_frontend() {
    echo "🏗️  Building frontend..."
    cd frontend
    
    # Install dependencies
    npm ci --production
    
    # Build for production
    npm run build
    
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    cd ..
}

# Deploy to Firebase
deploy_firebase() {
    echo "🔥 Deploying to Firebase..."
    cd frontend
    
    # Login to Firebase (if not already logged in)
    firebase login --ci
    
    # Deploy Firestore rules
    firebase deploy --only firestore:rules
    
    # Deploy Storage rules
    firebase deploy --only storage
    
    # Deploy hosting
    firebase deploy --only hosting
    
    echo -e "${GREEN}✅ Firebase deployment completed${NC}"
    cd ..
}

# Deploy backend (example for Railway)
deploy_backend() {
    echo "🚂 Deploying backend..."
    cd backend
    
    # Build and push Docker image
    if command -v railway &> /dev/null; then
        railway up
    else
        echo -e "${YELLOW}⚠️  Railway CLI not found. Please deploy manually${NC}"
        echo "1. Install Railway CLI: npm install -g @railway/cli"
        echo "2. Login: railway login"
        echo "3. Deploy: railway up"
    fi
    
    cd ..
}

# Main deployment function
main() {
    check_dependencies
    build_frontend
    deploy_firebase
    deploy_backend
    
    echo -e "${GREEN}🎉 FAMELO deployment completed successfully!${NC}"
    echo "Frontend: https://your-project-id.web.app"
    echo "Backend: https://your-backend-url.railway.app"
}

# Run main function
main "$@"