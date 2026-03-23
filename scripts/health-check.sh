#!/bin/bash

# ==========================================================================
# Personal AI Assistant - Health Check Script
# ==========================================================================
# Usage: bash scripts/health-check.sh
# Continuously monitor deployment health

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CHECK_INTERVAL=30
ALERT_EMAIL=${ALERT_EMAIL:- ""}

print_status() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

print_success() {
    echo -e "${GREEN}$(print_status '✅ '$1)${NC}"
}

print_error() {
    echo -e "${RED}$(print_status '❌ '$1)${NC}"
}

check_service() {
    local service=$1
    local url=$2
    local timeout=${3:-10}
    
    if curl -sf --connect-timeout $timeout "$url" > /dev/null 2>&1; then
        print_success "$service is healthy"
        return 0
    else
        print_error "$service is DOWN"
        return 1
    fi
}

# Main loop
print_status "🔍 Starting health checks..."

failed_checks=0
max_consecutive_failures=3

while true; do
    all_healthy=true
    
    # Check backend
    if ! check_service "Backend" "http://localhost:8000/health"; then
        ((failed_checks++))
        all_healthy=false
    else
        failed_checks=0
    fi
    
    # Check frontend
    if ! check_service "Frontend" "http://localhost:3000"; then
        ((failed_checks++))
        all_healthy=false
    fi
    
    # Check Ollama
    if ! check_service "Ollama" "http://localhost:11434/api/tags"; then
        ((failed_checks++))
        all_healthy=false
    fi
    
    # Check PostgreSQL
    if ! docker exec personal-ai-db-prod pg_isready -U personal_ai_user > /dev/null 2>&1; then
        print_error "Database is DOWN"
        ((failed_checks++))
        all_healthy=false
    else
        print_success "Database is healthy"
    fi
    
    # Alert if too many failures
    if [ $failed_checks -ge $max_consecutive_failures ]; then
        print_error "Multiple services failed - potential system failure!"
        if [ -n "$ALERT_EMAIL" ]; then
            echo "System alert: Multiple services failed" | mail -s "Personal AI Assistant - Health Alert" "$ALERT_EMAIL"
        fi
    fi
    
    # Overall status
    if [ "$all_healthy" = true ]; then
        print_success "All systems operational"
    else
        print_error "System degraded - $failed_checks service(s) failing"
    fi
    
    print_status "Next check in ${CHECK_INTERVAL}s..."
    echo ""
    
    sleep $CHECK_INTERVAL
done
