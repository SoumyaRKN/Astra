#!/bin/bash

# Install Ollama

echo "Installing Ollama..."
echo "===================="
echo ""

if command -v ollama &> /dev/null; then
    echo "✓ Ollama is already installed"
    echo "Version: $(ollama --version)"
    exit 0
fi

echo "Downloading and installing Ollama..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    curl -fsSL https://ollama.ai/install.sh | sh
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Please download from: https://ollama.ai/download"
    open "https://ollama.ai/download"
elif [[ "$OSTYPE" == "msys" ]]; then
    # Windows
    echo "Please download from: https://ollama.ai/download"
    start "https://ollama.ai/download"
fi

echo ""
echo "✓ Ollama installed!"
echo ""
echo "To download the model, run:"
echo "  ollama pull mistral:3b-instruct-q4_K_M"
echo ""
echo "To start Ollama server, run:"
echo "  ollama serve"
