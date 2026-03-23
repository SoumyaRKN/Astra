#!/bin/bash

# ==========================================================================
# Personal AI Assistant - Production Deployment Script
# ==========================================================================
# Usage: bash scripts/deploy-production.sh
# This script deploys to production with proper security and monitoring

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_TIMEOUT=300
HEALTH_CHECK_RETRIES=30

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

# Check environment
print_header "Checking Production Environment"

if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found"
    exit 1
fi
print_success ".env.production loaded"

# Verify Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker not found on production server"
    exit 1
fi
print_success "Docker is installed"

# Backup current deployment
print_header "Creating Backup"

BACKUP_DIR="backups/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "docker compose.prod.yml" ]; then
    cp docker compose.prod.yml "$BACKUP_DIR/"
    print_success "Backed up current deployment"
fi

# Pull latest images
print_header "Pulling Latest Images"

docker pull ghcr.io/your-org/personal-ai-assistant/backend:latest
print_success "Backend image pulled"

docker pull ghcr.io/your-org/personal-ai-assistant/frontend:latest
print_success "Frontend image pulled"

# Load environment
export $(cat .env.production | xargs)

# Stop old containers (gracefully)
print_header "Stopping Current Deployment"

docker compose -f docker compose.prod.yml down || true
print_success "Old containers stopped"

# Start new deployment
print_header "Starting New Deployment"

docker compose -f docker compose.prod.yml up -d

print_success "Services started"

# Health checks
print_header "Verifying Deployment"

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -sf http://localhost:8000/health > /dev/null; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
        print_error "Backend health check failed"
        print_error "Rolling back to previous version..."
        docker compose -f docker compose.prod.yml down
        print_error "Deployment failed and rolled back"
        exit 1
    fi
    sleep 2
done

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -sf http://localhost:3000 > /dev/null; then
        print_success "Frontend is healthy"
        break
    fi
    if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
        print_error "Frontend health check failed"
        exit 1
    fi
    sleep 2
done

print_header "Deployment Complete! 🎉"
echo -e "${GREEN}Production deployment successful${NC}"
echo -e "Backup location: ${BACKUP_DIR}"
