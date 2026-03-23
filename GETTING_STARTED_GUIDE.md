# 📖 Getting Started Guide

**Version:** 1.0  
**Last Updated:** March 23, 2026  
**Target Audience:** Users and developers setting up Personal AI Assistant

---

## 🎯 Quick Overview

The **Personal AI Assistant** is a self-hosted AI companion that can:

- 💬 Chat with you using a local LLM (no data leaves your server)
- 🎤 Listen to your voice and respond vocally
- 😊 Animate an avatar that responds to you
- 🖼️ Generate images from your descriptions
- 🎬 Create videos with animations
- 🎵 Generate background music and enhance audio
- 📱 Run on web browsers, desktop, or mobile devices

---

## 📋 System Requirements

### Minimum Requirements

- **CPU:** 4+ cores (preferably Intel i5/AMD Ryzen 5 or better)
- **RAM:** 16 GB (32+ GB recommended)
- **Storage:** 100 GB SSD available
- **GPU:** Optional but recommended (NVIDIA CUDA for faster AI processing)
- **Internet:** For initial setup only (after setup, works offline)
- **OS:** Ubuntu 20.04+, macOS 12+, or Windows with WSL2

### Recommended Setup (for best performance)

- **CPU:** 8+ cores
- **RAM:** 32+ GB
- **Storage:** 500 GB+ SSD
- **GPU:** NVIDIA GPU with 6+ GB VRAM (optional but speeds up AI tasks 10-100x)

---

## 🚀 Installation & Local Setup

### Step 1: Prerequisites

**Install Docker & Docker Compose:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker compose-plugin -y
sudo usermod -aG docker $USER
newgrp docker

# macOS (using Homebrew)
brew install docker compose

# Verify installation
docker --version
docker compose --version
```

**Install Git:**

```bash
# Ubuntu/Debian
sudo apt-get install git -y

# macOS
brew install git
```

### Step 2: Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/personal-ai-assistant.git
cd personal-ai-assistant

# Verify directory structure
ls -la
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit for local development
nano .env
```

**Local `.env` Configuration:**

```bash
# Database
DB_USER=personal_ai_user
DB_PASSWORD=local_password_123
DB_NAME=personal_assistant
DB_HOST=db
DB_PORT=5432

# Ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=mistral:3b-instruct-q4_K_M

# API
API_BASE_URL=http://localhost:8000
WS_URL=ws://localhost:8000/ws

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Development
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

### Step 4: Deploy Locally

```bash
# Make deployment script executable
chmod +x scripts/deploy-local.sh

# Run deployment (this builds and starts all services)
bash scripts/deploy-local.sh
```

**Expected Output:**

```
✓ Docker is installed
✓ Docker Compose is installed
✓ Building images...
✓ Starting services...
✓ Waiting for services to be ready...
✓ Health check for Backend: PASSED
✓ Health check for Frontend: PASSED
✓ Health check for Ollama: PASSED
✓ Health check for Database: PASSED
✓ All systems operational!

Access your Personal AI Assistant:
  Frontend: http://localhost:3000
  Backend API: http://localhost:8000
  API Documentation: http://localhost:8000/docs
```

### Step 5: Access the Application

Open your web browser and navigate to:

```
Frontend:        http://localhost:3000
API Docs:        http://localhost:8000/docs (interactive API reference)
Ollama Admin:    http://localhost:11434
```

---

## 🎬 First Time Setup Wizard

### 1. Open the Frontend

Navigate to <http://localhost:3000>

### 2. Start Configuration

**Settings → Basic Configuration:**

```
✓ Username: Enter your name
✓ Language: English (or your preference)
✓ Theme: Dark or Light mode
✓ Voice: Select your preferred TTS voice
```

### 3. Voice Setup (Optional)

**Settings → Voice Configuration:**

- **Speech-to-Text:** Enable microphone input
- **Text-to-Speech:** Choose voice and speed
- **Voice Cloning:** Upload 30-60 seconds of your voice (optional)

### 4. Avatar Setup (Optional)

**Settings → Avatar Customization:**

- **Avatar Style:** Select from available avatars
- **Animation Speed:** Adjust response animation speed
- **Display:** Choose when to show avatar

### 5. Test the Chat

**Home → Chat Interface:**

```
Type: "Hello! Can you introduce yourself?"

You should see:
✓ Message appears in chat
✓ Loading indicator shows backend is processing
✓ Response appears after 5-10 seconds
✓ Avatar animates (if enabled)
✓ Voice responds (if TTS enabled)
```

---

## 💬 Basic Usage

### Chat Interface

**Text Chat:**

```
User Types:     "What is the capital of France?"
Assistant:      "The capital of France is Paris. It's located in the 
                 north-central part of the country and is known for 
                 iconic landmarks like the Eiffel Tower and Notre-Dame."

User Types:     "Tell me more about the Eiffel Tower"
Assistant:      "The Eiffel Tower is a wrought-iron lattice tower 
                 built in 1889 for the World's Fair..." (continues with response)
```

**Voice Chat:**

```
Click Microphone Icon
Record:         "What's the weather like?"
Backend:        Transcribes speech to text, processes with LLM, 
                generates response, synthesizes to speech
Output:         Avatar speaks response, text appears in chat
```

### Conversation Management

**View History:**

```
Click "Conversations" in sidebar
Select conversation:    "Chat with AI about Python"
Time:                    "Today at 2:30 PM"
Preview:                 "I asked about Python..."

Click to resume conversation
```

**Start New Conversation:**

```
Click "New Chat" button
Empty chat interface appears
Start typing or speaking
```

**Delete Conversation:**

```
Click conversation
Click trash icon
Confirm deletion
```

---

## 🖼️ Generating Media

### Generate Images

**Steps:**

1. Click "Gallery" in sidebar
2. Click "Create" button
3. Select "Generate Image"
4. Enter prompt:

   ```
   "A serene mountain landscape with a cristal-clear lake at sunset, 
    oil painting style, highly detailed, professional"
   ```

5. Click "Generate"
6. Wait 30-120 seconds (depends on GPU)
7. View generated image
8. Save to gallery

**Tips for Better Images:**

- Be descriptive and specific
- Include artistic style: "oil painting", "photorealistic", "cartoon", etc.
- Mention quality: "highly detailed", "professional", "4K"
- Use positive prompts: what you want, not what you don't want

### Generate Videos

**Steps:**

1. Click "Gallery" → "Create" → "Generate Video"
2. Enter prompt and duration (5-30 seconds)
3. Click "Generate"
4. Wait 2-5 minutes (this is compute-intensive)
5. View video preview
6. Download or save

---

## 🔧 Settings & Configuration

### General Settings

**Theme:**

- Dark mode (default): Better for night use
- Light mode: Better for bright environments

**Language:**

- English (multiple regional variants)
- Other languages (if configured)

**Notifications:**

- Enable/disable chat notifications
- Enable/disable response alerts

### Voice Settings

**Text-to-Speech:**

- Voice Selection: Male, Female, Neutral
- Speech Rate: 0.5x - 2.0x
- Pitch: Adjustable
- Test playback before saving

**Speech-to-Text:**

- Microphone: Select input device
- Language: Auto-detect or specify
- Confidence threshold: When to accept transcription

**Voice Cloning (Advanced):**

- Record or upload sample voice (30-60 seconds)
- Name your voice clone
- Use in text-to-speech

### API Settings

**For Developers:**

```
API Key:           [Generated automatically]
API Base URL:      http://localhost:8000
WebSocket URL:     ws://localhost:8000
API Rate Limit:    10 requests/minute (default)
```

---

## 🐛 Troubleshooting

### Cannot access <http://localhost:3000>

**Problem:** Browser shows "Connection refused"

**Solution:**

```bash
# Check if container is running
docker ps | grep frontend

# View logs
docker logs personal-assistant-frontend

# Restart frontend
docker compose restart frontend

# Wait 10 seconds and retry
sleep 10
# Open browser again
```

### Chat takes too long to respond

**Problem:** Responses take 30+ seconds

**Possible Causes:**

1. **No GPU:** AI inference is CPU-bound
2. **First response:** First response is always slower
3. **Large model:** Using larger language model than system can handle
4. **System resources:** Other applications consuming RAM

**Solutions:**

```bash
# Check system resources
docker stats

# If Ollama is using 90%+ RAM, the model is too large
# Switch to smaller model in .env

# Restart services to clear memory
docker compose restart
```

### Frontend shows blank page

**Problem:** White/blank page at <http://localhost:3000>

**Solution:**

```bash
# Check frontend logs
docker logs personal-assistant-frontend

# Clear browser cache
# Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (macOS)
# Select "All time" and click "Clear data"

# Rebuild frontend
docker compose up -d --build frontend

# Wait 30 seconds and refresh browser
```

### Audio/microphone not working

**Problem:** Microphone button doesn't work

**Steps:**

1. **Grant browser permission:**
   - Click lock icon in address bar
   - Click "Site settings"
   - Microphone: "Allow"

2. **Check audio device:**

   ```bash
   # Linux
   pactl list short sources
   
   # macOS
   system_profiler SPAudioDataType
   ```

3. **Restart audio:**

   ```bash
   docker compose exec backend python -c "import sounddevice; print(sounddevice.default_device)"
   ```

### Database errors

**Problem:** "Database connection failed"

**Solution:**

```bash
# Check database is running
docker compose ps db

# Reset database (WARNING: deletes all data!)
docker compose down -v
docker compose up -d db

# Wait 10 seconds for database initialization
sleep 10
docker compose up -d

# Check logs
docker compose logs db
```

---

## 📚 Learning More

### Next Steps

1. **Explore API Documentation:**
   - Go to <http://localhost:8000/docs>
   - Try endpoints using interactive interface
   - Read parameter descriptions

2. **Custom Training (See: [TRAINING_GUIDE.md](TRAINING_GUIDE.md)):**
   - Fine-tune personality and responses
   - Train on custom knowledge base
   - Add specialized skills

3. **Production Deployment (See: [PHASE_7_COMPLETION.md](PHASE_7_COMPLETION.md)):**
   - Deploy to production server
   - Configure custom domain
   - Set up SSL certificates

4. **Development:**
   - Modify source code in `backend/` and `frontend/`
   - Changes auto-reload (hot reload enabled)
   - Review code in `backend/services/` and `frontend/src/`

### Useful Commands

```bash
# View all running services
docker compose ps

# View logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose stop

# Start all services
docker compose start

# Restart a service
docker compose restart backend

# Access backend shell (for debugging)
docker compose exec backend bash

# Run backend tests
docker compose exec backend pytest

# Access database shell
docker compose exec db psql -U personal_ai_user -d personal_assistant
```

### Database Queries (Advanced)

```bash
# Connect to database
docker compose exec db psql -U personal_ai_user -d personal_assistant

# View conversations
SELECT id, user_id, title, created_at FROM conversations ORDER BY created_at DESC;

# View messages
SELECT id, conversation_id, role, content, created_at FROM messages ORDER BY created_at DESC LIMIT 20;

# Count total messages
SELECT COUNT(*) FROM messages;

# Exit database
\q
```

---

## 💡 Tips & Best Practices

### Getting Better Responses

1. **Be specific:**
   - ❌ "Tell me about cats"
   - ✅ "Tell me about the behavioral patterns of domestic cats, including how they communicate"

2. **Provide context:**
   - ❌ "What should I do?"
   - ✅ "I'm learning Python and struggling with async/await. What's a good way to understand this?"

3. **Ask follow-up questions:**
   - "Explain that more simply"
   - "Give me examples"
   - "What are the pros and cons?"

### Performance Optimization

1. **Keep conversations focused:**
   - Long conversations use more memory
   - Start new chats for different topics

2. **Manage conversation history:**
   - Archive old conversations you don't need
   - Recent conversations load faster

3. **System resources:**
   - Close unnecessary applications
   - Avoid running heavy tasks while using AI
   - Allocate more resources to Docker if available

---

## 🆘 Getting Help

### Documentation Structure

```
README.md                       ← Project overview
QUICK_START.md                 ← Quick setup (5 minutes)
GETTING_STARTED_GUIDE.md       ← This file (detailed setup)
TRAINING_GUIDE.md              ← Train & customize the AI
USER_GUIDE.md                  ← How to use features
PHASE_7_COMPLETION.md          ← Production deployment
PRODUCTION_SECURITY.md         ← Security guidelines
docs/API.md                    ← API documentation
docs/ARCHITECTURE.md           ← System design
docs/TROUBLESHOOTING.md        ← Common issues
```

### Common Issues

**Still having problems?**

1. **Check Troubleshooting section above:** Most issues are covered
2. **Watch logs:** `docker compose logs -f` shows real-time activity
3. **Review documentation:** Each phase has detailed guides
4. **Check GitHub issues:** Others may have solved your problem
5. **Create issue with details:**
   - Docker version
   - System specs
   - Error message
   - Steps to reproduce

---

## 🎉 Ready to Go

You now have a fully functional Personal AI Assistant running locally.

**Next steps:**

1. ✅ Explore the chat interface
2. ✅ Try voice commands
3. ✅ Generate images
4. ✅ Customize settings
5. ✅ Read [TRAINING_GUIDE.md](TRAINING_GUIDE.md) to train the AI
6. ✅ Read [USER_GUIDE.md](USER_GUIDE.md) for all features

**Enjoy your Personal AI Assistant! 🚀**
