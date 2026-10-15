#!/bin/bash

echo "Starting FRAMELO Backend Server..."
echo "====================================="

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Start the server on localhost instead of 0.0.0.0
echo "Starting server on http://localhost:8000"
uvicorn main:app --reload --host localhost --port 8000