#!/usr/bin/env bash
# Astra — Run Script
# Starts backend and frontend together

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}"
echo "    _        _             "
echo "   / \   ___| |_ _ __ __ _ "
echo "  / _ \ / __| __| '__/ _\` |"
echo " / ___ \\\\__ \\ |_| | | (_| |"
echo "/_/   \\_\\___/\\__|_|  \\__,_|"
echo -e "${NC}"
echo -e "${BLUE}Starting Astra...${NC}"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Astra stopped${NC}"
}
trap cleanup EXIT INT TERM

# Check Ollama
echo -e "${YELLOW}Checking Ollama...${NC}"
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "  ${GREEN}Ollama is running${NC}"
else
    echo -e "  ${YELLOW}Ollama not running. Starting it...${NC}"
    if command -v ollama &>/dev/null; then
        ollama serve &>/dev/null &
        sleep 2
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            echo -e "  ${GREEN}Ollama started${NC}"
        else
            echo -e "  ${RED}Could not start Ollama. Start it manually: ollama serve${NC}"
        fi
    else
        echo -e "  ${RED}Ollama not installed. Install: curl -fsSL https://ollama.ai/install.sh | sh${NC}"
    fi
fi
echo ""

# Start backend
echo -e "${YELLOW}Starting backend...${NC}"
cd "$ROOT/backend"
source .venv/bin/activate
python main.py &
BACKEND_PID=$!
cd "$ROOT"

# Wait for backend
echo -n "  Waiting for backend"
for i in $(seq 1 30); do
    if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
        echo ""
        echo -e "  ${GREEN}Backend running on http://127.0.0.1:8000${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Start frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
cd "$ROOT"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Astra is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:   ${BLUE}http://127.0.0.1:8000${NC}"
echo -e "  API Docs:  ${BLUE}http://127.0.0.1:8000/docs${NC}"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop"
echo ""

# Wait for processes
wait
