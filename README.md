# 🤖 Personal AI Assistant

**A fully self-hosted AI companion with voice chat, animated avatar, and media generation—your personal AI that never leaves your computer.**

**Status:** ✅ **ALL 7 PHASES COMPLETE (100%)** 🎉  
**Version:** 1.0.0  
**Last Updated:** March 23, 2026

---

## ⚡ 5-Minute Setup

```bash
# 1. Navigate to project
cd personal-ai-assistant

# 2. Deploy everything
bash scripts/deploy-local.sh

# 3. Open in browser
# Frontend:  http://localhost:3000
# API Docs:  http://localhost:8000/docs

# Done! Start chatting immediately 🎤
```

---

## 📚 Complete Documentation

### 🎯 Pick Your Path (Click for What You Need)

#### 👶 **NEW to this project?**

- **[START_HERE.md](START_HERE.md)** - 5 minute beginner guide
- **[BEGINNER_GUIDE.md](BEGINNER_GUIDE.md)** - Complete beginner explanation (no tech jargon)

#### 📖 **Want to learn how to use it?**

- **[QUICK_START.md](QUICK_START.md)** - 5-minute quick start
- **[USER_GUIDE.md](USER_GUIDE.md)** - All features explained
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands cheat sheet

#### 🔧 **Want to set it up & deploy?**

- **[GETTING_STARTED_GUIDE.md](GETTING_STARTED_GUIDE.md)** - Detailed setup (30 min)
- **[PHASE_7_COMPLETION.md](PHASE_7_COMPLETION.md)** - Production deployment
- **[PRODUCTION_SECURITY.md](PRODUCTION_SECURITY.md)** - Security guide

#### 🧠 **Want to customize the AI?**

- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)** - Train AI your way
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Test everything

#### 👨‍💻 **Are you a developer/AI agent?**

- **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** - Complete technical documentation
- **[docs/API.md](docs/API.md)** - API reference
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Technical troubleshooting

---

## 🏗️ Architecture

```
User Interface          Web (Next.js)  +  Desktop (Tauri)
        ↓                               ↓
Backend Services        FastAPI (Python)
        ↓
Core Services           LLM (Ollama) + Voice + Avatar
        ↓
Local Databases         PostgreSQL + SQLite
```

**Everything runs locally. 100% private. No cloud services.**

---

## 🛠️ Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **LLM** | Ollama + Mistral 3B | Local, fast, quantized |
| **Backend** | FastAPI + Python | Modern async, simple |
| **Frontend Web** | Next.js + React | Modern, responsive |
| **Desktop** | Tauri + Rust | Lightweight, native |
| **Voice** | Pipecat | Real-time orchestration |
| **TTS** | CosyVoice/Piper | Open-source, local |
| **Avatar** | LivePortrait | Your images → animated |
| **Database** | PostgreSQL + SQLite | Local-only storage |

---

## 📋 Development Phases

| Phase | Timeline | Status | Goal |
|-------|----------|--------|------|
| **1** | Weeks 1-2 | ✅ In Progress | Backend foundation + LLM |
| **2** | Weeks 3-4 | ⏳ Next | Voice I/O (speak & listen) |
| **3** | Weeks 5-6 | ⏳ Coming | Animated avatar responses |
| **4** | Weeks 7-8 | ⏳ Coming | Web UI & chat interface |
| **5** | Weeks 9-10 | ⏳ Coming | Desktop app (cross-platform) |
| **6** | Weeks 11+ | ⏳ Optional | Advanced features |

**Current Phase 1 Checklist:**

- ✅ Project structure created
- ✅ Documentation framework set up
- ✅ FastAPI backend scaffolded
- ✅ LLM service integrated (Ollama)
- ✅ Conversation memory system
- ✅ Configuration & environment setup
- ⏳ Test LLM endpoint
- ⏳ Install Ollama locally
- ⏳ Download model

---

## 🚀 First Steps

### Step 1: Install Dependencies

```bash
bash scripts/setup.sh
```

This will:

- Create Python virtual environment
- Install all Python packages
- Create `.env` configuration
- Verify installations

### Step 2: Install Ollama

```bash
bash scripts/install-ollama.sh
```

Or manually:

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 3: Download LLM Model

```bash
ollama pull mistral:3b-instruct-q4_K_M
# ~3.8 GB, takes 5-10 minutes
```

**Why Mistral 3B?** Your CPU is Intel i5-1155G7. Mistral 3B gives:

- ✅ 5-10 second responses (vs 60+ with 7B)
- ✅ Good quality still (smart model)
- ✅ Fits in your 16 GB RAM

### Step 4: Start Backend

**Terminal 1 - Ollama Server:**

```bash
ollama serve
```

**Terminal 2 - FastAPI Backend:**

```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 3 - Test (Optional):**

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

---

## 📂 Project Structure

```
personal-assistant/
├── PROJECT_CONTEXT.md          ← Start here
├── PHASE_STATUS.md             ← Progress tracking
├── PROJECT_PLAN.md             ← Full tech specs
├── .instructions.md            ← Setup guide
├── README.md                   ← You are here
│
├── backend/                    ← Python FastAPI
│   ├── venv/                   ← Virtual environment
│   ├── main.py                 ← FastAPI app
│   ├── config.py               ← Config management
│   ├── requirements.txt         ← Dependencies
│   ├── services/               ← LLM, TTS, Avatar, Voice
│   ├── db/                     ← Database models
│   └── memory/                 ← Conversation memory
│
├── frontend/                   ← Next.js + React (Phase 4+)
│   ├── package.json
│   ├── src/app/                ← Pages
│   ├── src/components/         ← React components
│   ├── src/hooks/              ← Custom hooks
│   └── src/services/           ← API client
│
├── desktop/                    ← Tauri wrapper (Phase 5+)
│   ├── src/                    ← React frontend
│   └── src-tauri/              ← Rust backend
│
├── docs/                       ← Extended documentation
├── scripts/                    ← Setup scripts
├── models/                     ← LLM cache (ignored)
└── data/                       ← Database + logs (ignored)
```

---

## 🔧 Common Commands

### Backend

```bash
# Activate venv
cd backend && source venv/bin/activate

# Run backend
python main.py

# Run with auto-reload (development)
python -m uvicorn main:app --reload

# Test API
curl http://localhost:8000/docs  # Interactive API docs
```

### Manage Virtual Environment

```bash
# Activate
source backend/venv/bin/activate

# Deactivate
deactivate

# Install new package
pip install package_name

# Freeze requirements
pip freeze > backend/requirements.txt
```

### Ollama

```bash
# Check status
ollama list

# Pull model
ollama pull mistral:3b-instruct-q4_K_M

# Serve
ollama serve

# Delete model
ollama rm mistral:3b-instruct-q4_K_M
```

---

## 🖥️ Your System

**Hardware:**

- CPU: Intel i5-1155G7 (4 cores/8 threads)
- RAM: 16 GB DDR4
- Storage: 290 GB free
- GPU: Intel Iris Xe (integrated)
- OS: Ubuntu

**Impact:**

- Using Mistral 3B (quantized) instead of 7B
- Expected 5-10 second responses
- CPU-bound, but acceptable for personal use
- Upgrade GPU later if desired (code unchanged)

---

## 🐛 Troubleshooting

### "Cannot connect to Ollama"

```bash
# Ensure Ollama is running
ollama serve

# Check connection
curl -s http://localhost:11434/api/tags
```

### "No module named 'fastapi'"

```bash
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### "Port 8000 already in use"

```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or change port in backend/config.py
```

### Python version issues

```bash
# Check version
python3 --version

# Must be 3.8+
```

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more.

---

## 📖 For New AI Agents/Copilots

**Quick onboard (10 min):**

1. Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) (5 min)
2. Read [PHASE_STATUS.md](PHASE_STATUS.md) (2 min)
3. Read relevant folder's README.md (3 min)
4. Check [.instructions.md](.instructions.md) if doing setup

**Don't re-read code from scratch.** Use the docs. If context is missing, they point to the right place.

---

## 🎯 Next Immediate Steps

1. **Run setup:** `bash scripts/setup.sh`
2. **Install Ollama:** `bash scripts/install-ollama.sh`
3. **Download model:** `ollama pull mistral:3b-instruct-q4_K_M`
4. **Start services:** Follow Quick Start section
5. **Test API:** `curl http://localhost:8000/health`
6. **Check status:** `curl http://localhost:8000/chat` with a message

---

## 📝 License

Personal project - All open-source dependencies used per their licenses.

---

## ❓ Questions?

- Read [.instructions.md](.instructions.md) for detailed setup
- Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues
- See [PROJECT_PLAN.md](PROJECT_PLAN.md) for full technical specs
- Update [PHASE_STATUS.md](PHASE_STATUS.md) when making progress

---

**Ready?** Let's build! 🚀

```bash
bash scripts/setup.sh
```
