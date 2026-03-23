# 🧪 End-to-End Testing Guide

**Version:** 1.0  
**Last Updated:** March 23, 2026  
**Purpose:** Comprehensive testing to verify all components work

---

## 📋 Test Overview

This guide provides:

- ✅ **Automated Tests** - Run test suites to verify functionality
- ✅ **Manual Tests** - Step-by-step verification procedures
- ✅ **Integration Tests** - Test components working together
- ✅ **Performance Tests** - Verify system performs adequately
- ✅ **Security Tests** - Ensure safety practices followed

---

## 1. Pre-Test Preparation

### 1.1 System Requirements Check

```bash
# Verify Docker
docker --version
# Expected: Docker version 20.10+

# Verify Docker Compose
docker compose --version
# Expected: Docker Compose version 2.0+

# Check system resources
free -h          # Linux
vm_stat          # macOS
Measure-Object   # Windows

# Should have:
# - 4+ GB available RAM (16+ GB recommended)
# - 50+ GB available storage
# - Internet connection (for initial setup only)
```

### 1.2 Environment Setup

```bash
# Navigate to project
cd /path/to/personal-assistant

# Verify .env exists
ls -la .env

# Check environment variables
cat .env | grep -E "OLLAMA|DB_|CORS"
```

### 1.3 Clean Start

```bash
# Stop running services
docker compose down

# Remove old data (optional - clears conversations)
docker compose down -v

# Clear cache
docker system prune -f
```

---

## 2. Automated Tests

### 2.1 Backend Unit Tests

```bash
# Run backend tests
docker compose exec backend pytest -v

# Expected output:
# test_llm_service.py::test_ollama_connection PASSED
# test_llm_service.py::test_chat_endpoint PASSED
# test_db_models.py::test_conversation_creation PASSED
# ...
# =================== X passed in Y seconds ===================
```

**If tests fail:**

```bash
# View detailed error
docker compose exec backend pytest -v --tb=short

# Run specific test
docker compose exec backend pytest backend/test_llm_service.py::test_ollama_connection -v
```

### 2.2 Frontend Build Test

```bash
# Verify frontend builds
docker compose exec frontend npm run build

# Expected output:
# > next build
# ○ Compiling /
# ✓ Compiled client and server successfully
# ✓ Collecting page data
# ✓ Generating static pages
```

### 2.3 Linting Tests

```bash
# Backend lint
docker compose exec backend flake8 backend/ --exit-zero

# Frontend lint
docker compose exec frontend npm run lint

# Expected: Minimal or no warnings
```

### 2.4 Type Checking

```bash
# Frontend TypeScript check
docker compose exec frontend npm run type-check

# Expected: No type errors
```

---

## 3. Service Health Verification

### 3.1 Manual Health Checks

```bash
# Test Backend API
curl -s http://localhost:8000/health | python -m json.tool
# Expected: {"status": "ok", "timestamp": "..."}

# Test Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200

# Test Ollama
curl -s http://localhost:11434/api/tags | python -m json.tool
# Expected: {"models": [...]}

# Test Database
docker compose exec db pg_isready -U personal_ai_user
# Expected: "accepting connections"
```

### 3.2 Service Status

```bash
# Check all services
docker compose ps

# Expected output looks like:
# NAME                COMMAND              STATUS
# personal-asst-db    "docker-entrypoint"  Up (healthy)
# personal-asst-ollama "ollama serve"      Up (healthy)
# personal-asst-backend "uvicorn main:app" Up (healthy)
# personal-asst-frontend "next start"      Up (healthy)
```

### 3.3 Log Analysis

```bash
# Check for errors in all services
docker compose logs --tail=50 | grep -i "error\|exception\|failed"

# If errors found, check specific service
docker compose logs backend | grep -i error

# View backend startup sequence
docker compose logs backend | head -50
```

---

## 4. Integration Tests

### 4.1 Full Stack Chat Test

**Test Case: Simple Chat Message**

```bash
# Run test script
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, who are you?",
    "include_history": true
  }' | python -m json.tool
```

**Expected Response:**

```json
{
  "response": "I'm a personal AI assistant built to help you...",
  "conversation_id": "uuid-value",
  "tokens_used": 42,
  "response_time_ms": 3500
}
```

**Test Case: Multi-turn Conversation**

```bash
# First message
CONV_ID=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Python?"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['conversation_id'])")

# Second message (uses conversation context)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Explain more\", \"conversation_id\": \"$CONV_ID\"}"
```

**Verify:** Response references previous context

### 4.2 Voice Input/Output Test

**Manual Test: Voice Recording & Playback**

1. Go to <http://localhost:3000>
2. Click Settings → Voice → Enable
3. Grant microphone permission
4. Click 🎤 Microphone icon
5. Say: "Hello, this is a test"
6. Wait for transcription
7. Verify text appears in chat
8. Hear audio response
9. See animation (if enabled)

**Expected Results:**

- ✅ Transcription appears
- ✅ AI responds vocally
- ✅ No errors in logs: `docker compose logs backend | tail -20`

### 4.3 Image Generation Test

**Manual Test: Generate Image**

```bash
# Via API
curl -X POST http://localhost:8000/api/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "quality": "standard",
    "size": "1024x768"
  }'

# Expected: Returns image generation job ID and status
# Status: "processing" → "completed"
```

**Via UI:**

1. Go to Gallery
2. Click "Create" → "Generate Image"
3. Enter: "A serene mountain landscape"
4. Click Generate
5. Wait 30-120 seconds
6. Image appears
7. Download works

### 4.4 Database Persistence Test

```bash
# 1. Start a conversation
curl -X POST http://localhost:8000/api/chat \
  -d '{"message": "Test message"}' \
  > response.json

# 2. Get conversation ID
CONV_ID=$(cat response.json | python -c "import sys, json; print(json.load(sys.stdin)['conversation_id'])")

# 3. Query database
docker compose exec db psql -U personal_ai_user -d personal_assistant \
  -c "SELECT id, content FROM messages WHERE conversation_id='$CONV_ID';"

# 4. Verify message exists
# Expected: Shows your message in database
```

### 4.5 API Documentation

```bash
# Test that Swagger UI works
curl -s http://localhost:8000/docs > /dev/null
echo "Swagger UI Status: $(curl -o /dev/null -s -w "%{http_code}" http://localhost:8000/docs)"
# Expected: 200

# Test OpenAPI schema
curl -s http://localhost:8000/openapi.json | python -m json.tool | head -20
```

---

## 5. Performance Tests

### 5.1 Response Time Benchmark

```bash
# Test 1 - Simple question
time curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}' > /dev/null

# Expected: < 5 seconds total

# Test 2 - Complex question
time curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the theory of relativity"}' > /dev/null

# Expected: < 15 seconds total
```

### 5.2 Load Test

```bash
# Install load testing tool
pip install locust

# Create load test file
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class ChatUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def chat(self):
        self.client.post("/api/chat", 
            json={"message": "Hello"},
            headers={"Content-Type": "application/json"})
EOF

# Run load test (100 users, 5 messages each)
locust -f locustfile.py --host=http://localhost:8000 \
  -u 100 -r 10 --run-time 5m --headless
```

### 5.3 Resource Usage Monitoring

```bash
# Monitor in real-time
docker stats --no-stream

# Expected under normal load:
# - Backend: <50% CPU, <2GB RAM
# - Frontend: <30% CPU, <500MB RAM
# - Database: <40% CPU, <1GB RAM
# - Ollama: <80% CPU (or GPU usage), <4GB RAM
```

---

## 6. Security Tests

### 6.1 API Authentication Test

```bash
# Without API key (should fail)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' \
  -H "X-API-Key: invalid-key"
# Expected: 401 Unauthorized

# With valid API key
curl -X POST http://localhost:8000/api/chat \
  -H "X-API-Key: YOUR_VALID_KEY"
# Expected: 200 OK
```

### 6.2 CORS Test

```bash
# Test CORS headers from different origin
curl -i -X OPTIONS http://localhost:8000/api/chat \
  -H "Origin: https://other-domain.com" \
  -H "Access-Control-Request-Method: POST"

# Expected: Check headers include proper CORS rules
# Access-Control-Allow-Origin: configured domain(s)
```

### 6.3 SQL Injection Test

```bash
# Try SQL injection (should be safe)
curl -X POST http://localhost:8000/api/chat \
  -d '{"message": "1; DROP TABLE users; --"}'

# Expected: 
# - Message stored as literal string
# - No database damage
# - No error exposing database structure
```

### 6.4 Secrets Not Exposed

```bash
# Verify sensitive data not in logs
docker compose logs | grep -i "password\|secret\|key"
# Expected: No output or only redacted values

# Verify .env not in image
docker run --rm ghcr.io/your-org/backend:latest \
  ls /app/.env 2>&1
# Expected: File not found (404)
```

---

## 7. UI/UX Tests

### 7.1 Browser Compatibility

**Test on:**

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**For each browser:**

```
✓ Chat interface loads
✓ Messages send and receive
✓ Settings page accessible
✓ Avatar displays correctly
✓ Audio plays without issues
✓ No console errors (F12 → Console)
```

### 7.2 Responsive Design Test

**Test at different sizes:**

```
Desktop (1920x1080):     All elements visible, proper layout
Tablet (768x1024):        Sidebar collapsible, messages readable
Mobile (375x667):         Single column, large touch targets
```

**Manual test:**

1. Open <http://localhost:3000> in browser
2. Press F12 (DevTools)
3. Click device toolbar icon (mobile view)
4. Try different sizes
5. Verify buttons clickable, text readable

### 7.3 Dark Mode Test

1. Go to Settings
2. Toggle Theme: Light → Dark → Light
3. Verify colors correct at each setting
4. Refresh page
5. Verify setting persists

---

## 8. Error Handling Tests

### 8.1 Graceful Degradation

**Stop Ollama:**

```bash
docker compose stop ollama
# Try to chat → Should show friendly error
# Expected: "Ollama service unavailable. Retrying..."
```

**Stop Database:**

```bash
docker compose stop db
# Create new conversation → Should fail gracefully
# Expected: "Database connection failed"
```

### 8.2 Recovery Test

```bash
# Services stop unexpectedly
docker compose restart backend

# Try to use app
# Should still work (reconnects automatically)
# Check logs for errors
```

---

## 9. Test Checklist

### Core Functionality

- [ ] Backend API responds to requests
- [ ] Frontend loads and renders
- [ ] Database stores and retrieves data
- [ ] Ollama responds to LLM requests
- [ ] Chat works end-to-end

### Voice Features

- [ ] Microphone input captured
- [ ] Speech-to-text transcription works
- [ ] Text-to-speech plays audio
- [ ] Avatar animates

### Media Generation

- [ ] Images generate successfully
- [ ] Videos generate successfully
- [ ] Music/audio generation works
- [ ] Audio enhancement works

### User Experience

- [ ] Settings save correctly
- [ ] Conversations persist
- [ ] Navigation works
- [ ] Responsive on mobile
- [ ] Dark/light mode works

### Performance

- [ ] Chat responses < 10 seconds
- [ ] Images generate < 2 minutes
- [ ] UI responsive (< 100ms latency)
- [ ] No memory leaks over time

### Security

- [ ] API requires authentication
- [ ] CORS properly configured
- [ ] No secrets exposed in logs
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

### Error Handling

- [ ] Graceful failures
- [ ] Helpful error messages
- [ ] Auto-recovery
- [ ] No data loss on errors

---

## 10. Performance Baseline

**Document your system's baseline:**

```bash
# Run baseline tests
cat > run_baseline.sh << 'EOF'
#!/bin/bash

echo "=== Performance Baseline ===" > baseline.txt
echo "Date: $(date)" >> baseline.txt
echo "System: $(uname -a)" >> baseline.txt
echo "" >> baseline.txt

echo "Simple chat response time:" >> baseline.txt
time curl -X POST http://localhost:8000/api/chat \
  -d '{"message": "What is 2+2?"}' 2>&1 | grep real >> baseline.txt

echo "" >> baseline.txt
echo "Resource usage:" >> baseline.txt
docker stats --no-stream | tee -a baseline.txt

echo "" >> baseline.txt
echo "Image generation time:" >> baseline.txt
time curl -X POST http://localhost:8000/api/generate/image \
  -d '{"prompt": "A cat"}' 2>&1 | grep real >> baseline.txt

cat baseline.txt
EOF

bash run_baseline.sh
```

**Use baseline to detect regressions:**

```bash
# After making changes, compare to baseline
# Performance should not significantly worsen
```

---

## 11. Continuous Testing

### 11.1 Automated Test Suite

```bash
# Run all tests
bash scripts/run-tests.sh

# Expected output:
# Backend tests: ✅ All passed
# Frontend tests: ✅ All passed
# Integration tests: ✅ All passed
# Performance tests: ✅ Within baseline
```

### 11.2 Health Monitoring

```bash
# Continuous health check
bash scripts/health-check.sh &

# Check every 30 seconds if services healthy
# Alerts on failures
# Logs to health-check.log
```

---

## 12. Post-Test Report

**After completing all tests, document:**

```markdown
# Testing Report
Date: March 23, 2026
Tester: [Name]
System: [Hardware specs]

## Test Results
- Core Functionality: ✅ PASS
- Voice Features: ✅ PASS
- Media Generation: ✅ PASS
- Performance: ✅ PASS (within baseline)
- Security: ✅ PASS
- Error Handling: ✅ PASS

## Issues Found
(None found / List of issues)

## Recommendations
(Optimizations or improvements)

## Sign-off
All tests passed. System ready for deployment.
```

---

## 🎉 All Tests Passed

If all tests pass:

✅ Backend working correctly  
✅ Frontend rendering properly  
✅ Database operations successful  
✅ AI services responding  
✅ Voice in/output functional  
✅ Media generation working  
✅ Performance acceptable  
✅ Security validated  

**Your Personal AI Assistant is ready to use!** 🚀

---

## Troubleshooting Test Failures

### If Backend Tests Fail

```bash
# Check dependencies installed
docker compose exec backend pip list | grep pytest

# Run test with verbose output
docker compose exec backend pytest -vv --tb=long

# Check database connection
docker compose exec backend python -c \
  "from db.database import SessionLocal; SessionLocal()"
```

### If Frontend Tests Fail

```bash
# Check Node installation
docker compose exec frontend npm --version

# Run specific test
docker compose exec frontend npm test -- specific-test.js

# Check build errors
docker compose exec frontend npm run build 2>&1 | tail -50
```

### If API Tests Fail

```bash
# Check API is actually running
curl -v http://localhost:8000/health

# Check port binding
docker port personal-assistant-backend

# View raw request/response
curl -v -X POST http://localhost:8000/api/chat
```

### If Performance Tests Fail

```bash
# Check system resources
docker stats --no-stream

# Profile backend performance
docker compose exec backend python -m cProfile -s cumtime main.py

# Check for slow queries
docker compose exec db \
  psql -U personal_ai_user -d personal_assistant \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

**Ready to test?** Start with Section 1 and work through systematically! ✅
