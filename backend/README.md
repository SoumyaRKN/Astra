# Backend Architecture Guide

## Overview

The backend is a FastAPI-based service that orchestrates all AI operations:

- LLM conversation management
- Voice processing orchestration
- Avatar generation
- Real-time communication

## Architecture

```
FastAPI App (main.py)
├─ Config Management (config.py)
├─ Database (db/)
│  ├─ Database connections
│  ├─ Models (ORM)
│  └─ Migrations
├─ Services (services/)
│  ├─ LLM Service (Ollama integration)
│  ├─ TTS Service (text-to-speech)
│  └─ Avatar Service (LivePortrait)
└─ Memory (memory/)
   └─ Conversation Memory
```

## Services

### LLM Service (`services/llm_service.py`)

**Purpose:** Interface with Ollama for LLM operations

**Key Methods:**

- `check_ollama_health()` — Verify Ollama is running
- `get_response(message, conversation_id, include_history)` — Get LLM response
- `stream_response(prompt)` — Stream tokens for real-time display

**Example:**

```python
from services import llm_service

response = await llm_service.get_response(
    message="Hello!",
    conversation_id="conv_123",
    include_history=True
)
```

### Memory Service (`memory/conversation_memory.py`)

**Purpose:** Manage multi-turn conversation history

**Key Methods:**

- `add_message(conversation_id, role, content)` — Store message
- `get_context(conversation_id, max_messages)` — Get formatted history
- `clear_conversation(conversation_id)` — Reset history

**Example:**

```python
from memory import ConversationMemory

memory = ConversationMemory()
memory.add_message("conv_123", "user", "Hello")
memory.add_message("conv_123", "assistant", "Hi there!")
context = memory.get_context("conv_123")
```

## API Endpoints

### Health & Info

**GET /health**

```json
{
  "status": "healthy",
  "ollama_connected": true,
  "database_connected": true,
  "model": "mistral:3b-instruct-q4_K_M"
}
```

**GET /info**

```json
{
  "app_name": "Personal AI Assistant",
  "version": "0.1.0",
  "ollama": {
    "base_url": "http://localhost:11434",
    "model": "mistral:3b-instruct-q4_K_M"
  }
}
```

### Chat

**POST /chat**

Request:

```json
{
  "message": "Hello!",
  "conversation_id": "conv_123",
  "include_history": true
}
```

Response:

```json
{
  "conversation_id": "conv_123",
  "user_message": "Hello!",
  "assistant_response": "Hi! How can I help you today?",
  "tokens_used": 42,
  "processing_time_ms": 3250
}
```

## Configuration

Settings are managed via environment variables (see `.env.example`):

- `OLLAMA_BASE_URL` — Ollama server location
- `OLLAMA_MODEL` — Model to use
- `DATABASE_URL` — Database connection
- `LLM_TEMPERATURE` — Response randomness (0-1)
- `LLM_MAX_TOKENS` — Maximum response length

## Development

### Run Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

### Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# API docs
open http://localhost:8000/docs
```

### Add New Service

1. Create file in `services/new_service.py`
2. Implement service class
3. Import in `services/__init__.py`
4. Add endpoint in `main.py`

## Phase 1 Status

- ✅ FastAPI setup
- ✅ LLM service (Ollama integration)
- ✅ Conversation memory
- ✅ Basic chat endpoint
- ⏳ Database integration (Phase 2)
- ⏳ WebSockets for real-time (Phase 2)
- ⏳ TTS/Avatar services (Phase 2-3)

## Phase 2 Tasks

- [ ] Implement database models (SQLAlchemy)
- [ ] Create database migrations
- [ ] Persist conversations to database
- [ ] Add TTS service (CosyVoice/Piper)
- [ ] Add WebSocket endpoint for real-time voice
- [ ] Implement Pipecat integration

## Future Phases

- Phase 3: Avatar animation (LivePortrait)
- Phase 4: Web frontend (Next.js)
- Phase 5: Desktop app (Tauri)
- Phase 6: Advanced features (personality, memory)

## Troubleshooting

**"Cannot connect to Ollama"**

- Ensure `ollama serve` is running in another terminal
- Check `OLLAMA_BASE_URL` in `.env`

**"Module not found"**

- Activate venv: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

**"Port 8000 already in use"**

- Kill existing process: `lsof -ti:8000 | xargs kill -9`
- Or change port in `config.py`

See [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) for more.
