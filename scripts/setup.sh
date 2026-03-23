#!/bin/bash

# Personal AI Assistant - Complete Setup Script

set -e  # Exit on error

# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🚀 Personal AI Assistant - Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Python version
echo "Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    print_step "Python 3 found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Setup Backend
echo ""
echo "Setting up Backend..."
echo "--------------------"

cd "$BACKEND_DIR"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    print_step "Virtual environment created"
else
    print_warn "Virtual environment already exists"
fi

# Activate venv
source venv/bin/activate
print_step "Virtual environment activated"

# Copy .env from template if it doesn't exist
# if [ ! -f ".env" ]; then
#     cp .env.example .env
#     print_step "Created .env from template"
# else
#     print_warn ".env already exists"
# fi

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
print_step "Dependencies installed"

# Verify installation
echo ""
echo "Verifying installations..."
python -c "import fastapi; print(f'✓ FastAPI {fastapi.__version__}')" 2>/dev/null || print_error "FastAPI not installed"
python -c "import langchain; print(f'✓ LangChain {langchain.__version__}')" 2>/dev/null || print_error "LangChain not installed"

echo ""
print_step "Backend setup complete!"

# Check Ollama
echo ""
echo "Checking Ollama..."
echo "-----------------"

if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>&1)
    print_step "Ollama found: $OLLAMA_VERSION"
    print_step "Run 'ollama serve' in a new terminal to start the Ollama server"
else
    print_warn "Ollama not installed"
    echo "Install it from: https://ollama.ai"
    echo "Or run: curl -fsSL https://ollama.ai/install.sh | sh"
fi

echo ""
echo "========================================"
echo "Setup Complete! Next Steps:"
echo "========================================"
echo ""
echo "1. In a terminal, start Ollama:"
echo "   ollama serve"
echo ""
echo "2. In another terminal, download the model:"
echo "   ollama pull mistral:3b-instruct-q4_K_M"
echo ""
echo "3. In another terminal, start the backend:"
echo "   cd '$BACKEND_DIR'"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "4. Test the API:"
echo "   curl http://localhost:8000/health"
echo ""
echo "5. View API docs:"
echo "   open http://localhost:8000/docs"
echo ""
echo "========================================"
