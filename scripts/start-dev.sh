#!/bin/bash

# Start development environment

echo "Starting Personal AI Assistant - Development Environment"
echo "=========================================================="
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Check if Ollama is running
echo "Checking Ollama status..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running!"
    echo "Please start it in another terminal with: ollama serve"
    echo ""
fi

# Start backend
echo "Starting FastAPI backend..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Run: bash scripts/setup.sh"
    exit 1
fi

source venv/bin/activate

echo ""
echo "✓ Backend starting on http://localhost:8000"
echo "✓ API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python main.py

deactivate
