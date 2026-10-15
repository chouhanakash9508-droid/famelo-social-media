#!/bin/bash

# Production startup script for FAMELO backend

set -e

echo "Starting FAMELO Backend in Production Mode..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Run database migrations if needed
echo "Checking database setup..."

# Start the application with Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn main:app \
    --workers ${API_WORKERS:-4} \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind ${API_HOST:-0.0.0.0}:${API_PORT:-8000} \
    --access-logfile - \
    --error-logfile - \
    --log-level ${LOG_LEVEL:-info} \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload