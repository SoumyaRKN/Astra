#!/bin/bash

# ==========================================================================
# Personal AI Assistant - Local Deployment Script
# ==========================================================================
# Usage: bash scripts/deploy-local.sh
# This script deploys the entire stack locally using Docker Compose

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Main script
print_header "Personal AI Assistant - Local Deployment"

# Check Docker installation
print_header "Step 1: Checking Prerequisites"

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    echo "Fix: Install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
print_success "Docker is installed ($(docker --version | cut -d' ' -f3))"

if ! command -v docker &> /dev/null || ! docker ps &> /dev/null; then
    print_warning "Docker daemon is not running or permission denied"
    echo ""
    echo "SOLUTIONS:"
    echo "1. Make sure Docker Desktop is running (Windows/Mac)"
    echo "2. On Linux, run: sudo usermod -aG docker \$USER && newgrp docker"
    echo "3. Then restart your terminal and try again"
    exit 1
fi
print_success "Docker daemon is accessible"

if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed."
    echo "Fix: Install Docker Desktop which includes Compose"
    exit 1
fi
print_success "Docker Compose is installed ($(docker compose version | cut -d' ' -f3-4))"

# Load environment variables
print_header "Step 2: Loading Environment Variables"

if [ ! -f ".env.local" ]; then
    if [ ! -f ".env.example" ]; then
        print_error ".env.example not found"
        exit 1
    fi
    print_warning ".env.local not found, creating from .env.example..."
    cp .env.example .env.local
    print_success ".env.local created with default values"
    echo "  ✓ You can edit .env.local to customize settings"
else
    print_success ".env.local found and loaded"
fi

# Create required directories
print_header "Step 3: Creating Required Directories"

mkdir -p assets backend/migrations data models
print_success "Directories created"

# Build images
print_header "Step 4: Building Docker Images"

print_warning "Building backend image (this may take 3-5 minutes)..."
if ! docker compose build backend 2>&1 | tail -5; then
    print_error "Failed to build backend image"
    echo "  Troubleshooting:"
    echo "  1. Check internet connection"
    echo "  2. Check disk space (need ~10GB)"
    echo "  3. Run: docker system prune to clean up"
    exit 1
fi
print_success "Backend image built successfully"

print_warning "Building frontend image (this may take 2-3 minutes)..."
if ! docker compose build frontend 2>&1 | tail -5; then
    print_error "Failed to build frontend image"
    exit 1
fi
print_success "Frontend image built successfully"

# Start services
print_header "Step 5: Starting Services"

print_warning "Pulling Ollama image..."
docker compose pull ollama
print_success "Ollama image pulled"

print_warning "Starting database..."
docker compose up -d db
sleep 10
print_success "Database started"

print_warning "Starting Ollama..."
docker compose up -d ollama
sleep 15
print_success "Ollama started"

print_warning "Starting backend..."
docker compose up -d backend
sleep 10
print_success "Backend started"

print_warning "Starting frontend..."
docker compose up -d frontend
sleep 5
print_success "Frontend started"

# Health checks
print_header "Step 6: Verifying Services"

print_warning "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed health check"
        exit 1
    fi
    sleep 2
done

print_warning "Checking frontend health..."
for i in {1..30}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Frontend failed health check"
        exit 1
    fi
    sleep 2
done

# Display information
print_header "Deployment Complete! 🎉"

echo ""
echo -e "${GREEN}Services are running:${NC}"
echo -e "  Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e "  Ollama:    ${BLUE}http://localhost:11434${NC}"
echo -e "  Database:  ${BLUE}localhost:5432${NC}"
echo ""

echo -e "${GREEN}Useful commands:${NC}"
echo "  View logs:     docker compose logs -f"
echo "  Stop all:      docker compose down"
echo "  Restart all:   docker compose restart"
echo "  Backend logs:  docker compose logs -f backend"
echo "  Frontend logs: docker compose logs -f frontend"
echo ""

print_success "Ready to start using your Personal AI Assistant!"
