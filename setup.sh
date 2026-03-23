#!/usr/bin/env bash
# Astra — Setup Script
# Installs all dependencies for backend and frontend

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "    _        _             "
echo "   / \   ___| |_ _ __ __ _ "
echo "  / _ \ / __| __| '__/ _\` |"
echo " / ___ \\\\__ \\ |_| | | (_| |"
echo "/_/   \\_\\___/\\__|_|  \\__,_|"
echo -e "${NC}"
echo -e "${BLUE}Local AI Assistant — Setup${NC}"
echo ""

ROOT="$(cd "$(dirname "$0")/" && pwd)"
cd "$ROOT"

# --- Check prerequisites ---

echo -e "${YELLOW}Checking prerequisites...${NC}"

# Python
if ! command -v python3 &>/dev/null; then
    echo -e "${RED}Python 3 is required. Install it first.${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "  Python: ${GREEN}$PYTHON_VERSION${NC}"

# Node.js
if ! command -v node &>/dev/null; then
    echo -e "${RED}Node.js is required. Install it first.${NC}"
    echo "  Download from: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "  Node.js: ${GREEN}$NODE_VERSION${NC}"

# npm
if ! command -v npm &>/dev/null; then
    echo -e "${RED}npm is required.${NC}"
    exit 1
fi
echo -e "  npm: ${GREEN}$(npm --version)${NC}"

# Ollama
if command -v ollama &>/dev/null; then
    echo -e "  Ollama: ${GREEN}installed${NC}"
else
    echo -e "  Ollama: ${YELLOW}not found${NC}"
    echo -e "  ${YELLOW}Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh${NC}"
fi

echo ""

# --- Backend setup ---

echo -e "${YELLOW}Setting up backend...${NC}"

cd "$ROOT/backend"

if [ ! -d "venv" ]; then
    echo "  Creating virtual environment..."
    python3 -m venv venv
fi

echo "  Activating venv and installing packages..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate

echo -e "  ${GREEN}Backend ready${NC}"
echo ""

# --- Frontend setup ---

echo -e "${YELLOW}Setting up frontend...${NC}"

cd "$ROOT/frontend"
echo "  Installing npm packages..."
npm install --silent 2>/dev/null
echo -e "  ${GREEN}Frontend ready${NC}"
echo ""

# --- .env check ---

if [ ! -f "$ROOT/.env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > "$ROOT/.env" << 'EOF'
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
OLLAMA_TIMEOUT=120
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=512
DATABASE_URL=sqlite:///./astra.db
HOST=127.0.0.1
PORT=8000
EOF
    echo -e "  ${GREEN}.env created${NC}"
fi

# --- Ollama model ---

if command -v ollama &>/dev/null; then
    MODEL=$(grep OLLAMA_MODEL "$ROOT/.env" 2>/dev/null | cut -d'=' -f2 || echo "mistral")
    MODEL=${MODEL:-mistral}
    
    echo ""
    echo -e "${YELLOW}Checking Ollama model: ${MODEL}...${NC}"
    
    if ollama list 2>/dev/null | grep -q "$MODEL"; then
        echo -e "  ${GREEN}Model '$MODEL' is available${NC}"
    else
        echo -e "  ${YELLOW}Pulling model '$MODEL'... (this may take a few minutes)${NC}"
        ollama pull "$MODEL" || echo -e "  ${RED}Could not pull model. Start Ollama first: ollama serve${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Start Astra:  ${BLUE}./run.sh${NC}"
echo ""
