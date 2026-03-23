# 🚀 Quick Reference Guide

**Version:** 1.0  
**Purpose:** Fast lookup for common tasks

---

## 📍 Finding Your Way

### Getting Started (First Time)

```
1. QUICK_START.md          ← 5-minute setup
2. GETTING_STARTED_GUIDE.md ← Detailed setup
3. USER_GUIDE.md            ← Learn features
4. TRAINING_GUIDE.md        ← Customize AI
```

### I Want To

**Set up & run locally:**
→ [GETTING_STARTED_GUIDE.md](GETTING_STARTED_GUIDE.md) - Section 1-5

**Learn how to use it:**
→ [USER_GUIDE.md](USER_GUIDE.md) - Full feature guide

**Train/customize the AI:**
→ [TRAINING_GUIDE.md](TRAINING_GUIDE.md) - Section 1-8

**Deploy to production:**
→ [PHASE_7_COMPLETION.md](PHASE_7_COMPLETION.md) - Section 6

**Secure production setup:**
→ [PRODUCTION_SECURITY.md](PRODUCTION_SECURITY.md) - All sections

**Test everything:**
→ [TESTING_GUIDE.md](TESTING_GUIDE.md) - All tests

**Fix a problem:**
→ Jump to "Troubleshooting" in relevant guide

---

## ⚡ Quick Commands

### Start Services

```bash
# Full deployment
bash scripts/deploy-local.sh

# Or manual setup
docker compose build
docker compose up -d

# Check status
docker compose ps
```

### Access Services

```
Frontend:    http://localhost:3000
Backend API: http://localhost:8000
API Docs:    http://localhost:8000/docs
Ollama:      http://localhost:11434
Database:    localhost:5432
```

### Stop Services

```bash
# Stop all
docker compose down

# Stop with data wipe (careful!)
docker compose down -v

# Stop specific service
docker compose stop backend
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Last 50 lines
docker compose logs --tail=50 backend
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend

# Full rebuild
docker compose up -d --build
```

### Execute Commands

```bash
# Run Python command in backend
docker compose exec backend python -c "print('test')"

# Run Shell in backend
docker compose exec backend bash

# Run SQL query in database
docker compose exec db psql -U personal_ai_user -d personal_assistant
```

---

## 🎤 Voice Setup

### Enable Voice (First Time)

1. Go to <http://localhost:3000>
2. Settings → Voice
3. Click "Grant Permission" if prompted
4. Select voice and test

### Record Your Voice

```bash
# Record 30-60 seconds
rec -r 22050 -c 1 voice_sample.wav

# Or use Settings → Voice → Upload
```

### Use Voice

- Click 🎤 microphone icon to start recording
- Speak clearly
- Click 🎤 again to finish
- Wait for transcription and response

---

## 🖼️ Generate Images

### Quick Image

1. Go to Gallery
2. "Create" → "Generate Image"
3. Write prompt (be specific!)
4. Wait 30-120 seconds
5. Download or save

### Best Results

- Include: what (what is it?), style (art style?), mood, quality, lighting
- Example: "A serene Japanese garden with koi pond, oil painting, golden hour, highly detailed"
- Avoid: vague language, too many requests at once

---

## 🎬 Generate Videos

Similar to images but:

- Takes 2-5 minutes
- Specify duration (5-30 seconds)
- Use action verbs (flying, dancing, morphing)

---

## 🎵 Generate Music

1. Gallery → "Create" → "Generate Soundtrack"
2. Describe music (genre, mood, tempo)
3. Set length
4. Wait 30-60 seconds
5. Download

---

## 💬 Chat Tips

### Good Chat Practices

**Be specific:**

```
✓ "How do I install Python on Ubuntu 22.04?"
✗ "How to install Python?"
```

**Provide context:**

```
✓ "I'm learning web development. How does OAuth work?"
✗ "What is OAuth?"
```

**Ask for format:**

```
✓ "Explain Python decorators with 3 examples"
✗ "Tell me about decorators"
```

---

## 🎓 Training the AI

### Change Model

```bash
# Stop services
docker compose down

# Edit .env
nano .env
# Change: OLLAMA_MODEL=new-model

# Restart
docker compose up -d
```

### Adjust Personality

Edit backend/config.py - adjust:

- `SYSTEM_PROMPT` - How AI behaves
- `LLM_TEMPERATURE` - Creativity (0.1-1.0)
- `LLM_MAX_TOKENS` - Response length (256-1024)

Restart: `docker compose restart backend`

### Fine-tune on Q&A

1. Create training_data.json with questions & answers
2. Run: `python backend/fine_tune.py`
3. Share examples in system prompt
4. AI learns to respond similarly

---

## 🔧 Settings

### Theme

- Light mode: Settings → Theme → Light
- Dark mode: Settings → Theme → Dark

### Voice

- Text-to-Speech: Settings → Voice → Select voice
- Speech-to-Text: Settings → Voice → Microphone settings
- Voice Cloning: Settings → Voice → Upload sample

### Avatar

- Show/hide: Settings → Avatar → Show Avatar checkbox
- Style: Settings → Avatar → Select style
- Size: Settings → Avatar → Adjust size

### Privacy

- Export data: Settings → Privacy → Export Data
- Clear cache: Settings → Privacy → Clear Cache
- Delete history: Settings → Privacy → Delete History ⚠️

---

## 🐛 Troubleshooting Quick Fixes

### App won't load

```bash
docker compose restart frontend
# Wait 10 seconds, refresh browser
```

### Chat takes too long

```bash
# Check if CPU-bound
docker stats

# Use smaller model
# Edit .env: OLLAMA_MODEL=mistral:3b-instruct-q4_K_M
docker compose restart backend
```

### Voice not working

```bash
1. Grant mic permission in browser
2. Reset audio: Settings → Voice → Reset
3. Test microphone in system settings
4. Restart browser
```

### Can't generate images

```bash
# Check resources
docker stats

# Clear GPU memory
docker compose restart backend
```

### Database error

```bash
docker compose restart db

# Wait 10 seconds for DB to initialize
sleep 10
docker compose up -d
```

---

## 📊 Performance Optimization

### Speed Up Responses

```bash
# Use smaller model
OLLAMA_MODEL=mistral:3b-instruct

# Lower context length
LLM_CONTEXT_LENGTH=1024

# Restart
docker compose restart backend
```

### Free Disk Space

```bash
docker system prune -f        # Clean images
docker compose down -v        # Remove volumes ⚠️
```

### Monitor Performance

```bash
docker stats --no-stream

# Should see:
# Backend: <50% CPU, <2GB RAM
# Frontend: <30% CPU, <500MB RAM
```

---

## 🔒 Security Basics

### Protect .env.production

```bash
# Never share this file!
chmod 600 .env.production

# Use environment variables
export $(cat .env.production | xargs)

# Or use Docker secrets
docker secret create db_password .env.production
```

### Change Default Password

```bash
# In .env.production
DB_PASSWORD=generate_strong_password_here

# Generate random password
openssl rand -base64 32
```

### Rotate API Keys

```bash
# Generate new key
openssl rand -hex 32

# Update .env.production
API_KEY=new_key_here

# Restart backend
docker compose restart backend
```

---

## 📡 API Examples

### Chat via API

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"message": "Hello!"}'
```

### Generate Image via API

```bash
curl -X POST http://localhost:8000/api/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "quality": "standard"
  }'
```

### Get Conversation History

```bash
curl -X GET "http://localhost:8000/api/conversations?limit=10" \
  -H "X-API-Key: YOUR_KEY"
```

### Full API Docs

Visit: <http://localhost:8000/docs>

---

## 🚀 Deployment

### Deploy to Production

```bash
# 1. Prepare server
ssh user@production-server

# 2. Clone repository
git clone <repo> /opt/personal-ai

# 3. Configure environment
cd /opt/personal-ai
nano .env.production  # Set all variables

# 4. Deploy
bash scripts/deploy-production.sh

# 5. Monitor
bash scripts/health-check.sh &
```

### Setup SSL

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx config to use certificate
# Restart nginx
```

### Configure Domain

Update in .env.production:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
CORS_ORIGINS=["https://yourdomain.com"]
```

---

## 📚 Documentation Map

```
Personal Assistant/
├── README.md                    ← Project overview
├── QUICK_START.md               ← 5 min setup
├── GETTING_STARTED_GUIDE.md     ← Detailed setup
├── USER_GUIDE.md                ← All features
├── TRAINING_GUIDE.md            ← Customize AI
├── TESTING_GUIDE.md             ← Test everything
├── PHASE_7_COMPLETION.md        ← Production deploy
├── PRODUCTION_SECURITY.md       ← Security guide
└── docs/
    ├── API.md                   ← API reference
    ├── ARCHITECTURE.md          ← System design
    └── TROUBLESHOOTING.md       ← Common issues
```

---

## ✅ Common Workflows

### Workflow 1: First-Time Setup (30 minutes)

```
1. Clone repository
2. Run deploy-local.sh
3. Open http://localhost:3000
4. Configure Settings
5. Test chat
6. Done! ✅
```

### Workflow 2: Customize AI (1-2 hours)

```
1. Read TRAINING_GUIDE.md
2. Choose different model OR fine-tune on Q&A
3. Adjust SYSTEM_PROMPT
4. Set LLM_TEMPERATURE to control creativity
5. Restart backend
6. Test conversations
7. Iterate until satisfied
```

### Workflow 3: Generate Content (Varies)

```
Chat:
- Type message → Send → Get response (5-20 sec)

Images:
- Write prompt → Generate → Wait (30-120 sec)

Videos:
- Describe video → Generate → Wait (2-5 min)

Music:
- Describe music → Generate → Wait (30-60 sec)
```

### Workflow 4: Deploy to Production (2-4 hours)

```
1. Prepare production server (Ubuntu 20.04+)
2. Configure .env.production with secure values
3. Setup SSL certificate (Let's Encrypt)
4. Run deploy-production.sh
5. Configure domain DNS
6. Setup monitoring/health checks
7. Done! Live! 🎉
```

---

## 🆘 Need Help?

### Check Documentation First

1. Is it in USER_GUIDE.md? → Read that
2. Is it a setup issue? → GETTING_STARTED_GUIDE.md
3. Want to customize? → TRAINING_GUIDE.md
4. Having errors? → TESTING_GUIDE.md or TROUBLESHOOTING.md
5. Going to production? → PHASE_7_COMPLETION.md + PRODUCTION_SECURITY.md

### Common Questions

**Q: How do I change the AI's personality?**
A: See TRAINING_GUIDE.md Section 2 - edit SYSTEM_PROMPT

**Q: Can I use a GPU?**
A: Yes! See PHASE_7_COMPLETION.md - add nvidia-docker config

**Q: How do I backup conversations?**
A: Settings → Privacy → Export Data (downloads ZIP)

**Q: Is my data safe?**
A: Yes - everything stays on your server. See PRODUCTION_SECURITY.md

**Q: How do I use this without internet?**
A: Works completely offline after initial setup!

**Q: Can I run multiple users on one system?**
A: Not yet - multi-user is a future enhancement

**Q: What are the system requirements?**
A: 4+ CPU, 16+ GB RAM, 100GB storage. See GETTING_STARTED_GUIDE.md

---

## 📞 Getting Support

**Online:** GitHub Issues
**Documentation:** Read relevant guide first
**Logs:** `docker compose logs` shows detailed errors
**Manual:** See troubleshooting sections in each guide

---

## 🎉 You're All Set

**Quick start (Right now!):**

```bash
bash scripts/deploy-local.sh
# Wait 5 minutes...
# Open http://localhost:3000
# Start chatting! 🚀
```

**Choose your next step:**

- 💬 START CHATTING: Go to <http://localhost:3000>
- 📚 LEARN FEATURES: Read USER_GUIDE.md
- 🧠 TRAIN ON YOUR DATA: Read TRAINING_GUIDE.md
- 🚀 GO PRODUCTION: Read PHASE_7_COMPLETION.md
- 🧪 TEST EVERYTHING: Read TESTING_GUIDE.md

---

**Happy chatting with your Personal AI Assistant!** 🎊
