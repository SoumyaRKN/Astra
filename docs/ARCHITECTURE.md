# Architecture Deep-Dive

Comprehensive technical architecture documentation.

**Status:** Phase 1 - Foundation complete  
**Next Update:** After Phase 2 (Voice implementation)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Applications                            │
├──────────────────────────────┬──────────────────────────────────────┤
│    Web Frontend (Phase 4)    │    Desktop App - Tauri (Phase 5)     │
│   Next.js + React            │     + native capabilities            │
│   localhost:3000             │     + embedded backend               │
└──────────────────────────────┴──────────────────────────────────────┘
                              ↓
                    WebSocket / HTTP API
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                           │
│                    localhost:8000                                   │
├─────────────────────────────────────────────────────────────────────┤
│  API Layer:                                                         │
│  ├─ REST Endpoints (/chat, /health, /info)                        │
│  └─ WebSocket Endpoints (future: /ws/voice)                       │
│                                                                     │
│  Service Layer:                                                     │
│  ├─ LLM Service (Ollama integration)                               │
│  ├─ TTS Service (CosyVoice/Piper) — Phase 2                        │
│  ├─ STT Service (Whisper/Silero) — Phase 2                         │
│  ├─ Avatar Service (LivePortrait) — Phase 3                        │
│  └─ Voice Pipeline (Pipecat) — Phase 2                             │
│                                                                     │
│  Data Layer:                                                        │
│  ├─ Conversation Memory (in-memory)                                │
│  ├─ Database Models (SQLAlchemy) — Phase 2                         │
│  └─ Persistence Layer → PostgreSQL/SQLite                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Local Services & Data                             │
├─────────────────────────────────────────────────────────────────────┤
│  Ollama Server (localhost:11434)                                   │
│  ├─ LLM Inference Engine                                           │
│  ├─ Model: mistral:3b-instruct-q4_K_M (~3.8 GB)                   │
│  └─ Provides: Text generation API                                  │
│                                                                     │
│  PostgreSQL / SQLite (localhost:5432 or local file)                │
│  ├─ Conversations table                                            │
│  ├─ Messages table                                                 │
│  └─ User preferences table                                         │
│                                                                     │
│  File Storage                                                       │
│  ├─ Models cache (~10-20 GB)                                       │
│  ├─ TTS/Avatar cache                                               │
│  └─ Logs (data/logs/)                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Chat Request

```
1. User Types Message
   │
   ├─→ Frontend validates input
   │   └─→ Sends to Backend: POST /chat
   │
   └─→ FastAPI Receives Request
       │
       ├─→ Create ChatRequest object
       ├─→ Log request details
       │
       └─→ LLM Service receives message
           │
           ├─→ Get conversation history from Memory
           ├─→ Format prompt with context
           │
           └─→ Call Ollama API
               │
               ├─→ HTTP POST to localhost:11434/api/generate
               ├─→ Ollama processes (Mistral model)
               ├─→ Returns response tokens
               │
               └─→ Format response
                   │
                   ├─→ Store in Conversation Memory
                   ├─→ Create ChatResponse object
                   │
                   └─→ Return to Frontend
                       │
                       └─→ Display in Chat UI
```

---

## Component Details

### LLM Service (`backend/services/llm_service.py`)

**Responsibilities:**

- Interface with Ollama
- Manage conversation context
- Handle timeouts & retries
- Stream responses (Phase 2)

**Key Methods:**

```python
async def check_ollama_health() -> bool
    """Verify Ollama is responding"""

async def get_response(message, conversation_id, include_history) -> Dict
    """Get LLM response with optional history"""

async def _call_ollama(prompt) -> str
    """Direct call to Ollama API"""

async def stream_response(prompt)
    """Stream tokens for real-time display"""
```

**Ollama API Integration:**

```
POST http://localhost:11434/api/generate

Request:
{
  "model": "mistral:3b-instruct-q4_K_M",
  "prompt": "User: Hello\nAssistant:",
  "temperature": 0.7,
  "top_p": 0.9,
  "stream": false
}

Response:
{
  "response": "Hi! How can I help you?",
  "done": true,
  "context": [...]
}
```

---

### Conversation Memory (`backend/memory/conversation_memory.py`)

**In-Memory Storage (Phase 1):**

- Stores messages per conversation_id
- Formats context for LLM prompt
- Exposes methods for adding/retrieving messages

**Data Structure:**

```python
{
  "conversation_id": "conv_123",
  "messages": [
    {"role": "user", "content": "...", "timestamp": "..."},
    {"role": "assistant", "content": "...", "timestamp": "..."},
    ...
  ]
}
```

**Transitions to Database (Phase 2):**

- Move to SQLAlchemy models
- Use PostgreSQL for persistence
- Keep in-memory cache for performance

---

### FastAPI Application (`backend/main.py`)

**Startup/Shutdown Events:**

- Initialize database connections
- Check Ollama health
- Create log directory
- Load configuration

**Endpoints (Phase 1):**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Welcome message |
| `/health` | GET | Service health check |
| `/chat` | POST | Main chat interface |
| `/info` | GET | System configuration |

**Error Handling:**

- HTTP exceptions caught and logged
- General exceptions return 500 status
- Detailed error messages in development

---

### Configuration System (`backend/config.py`)

**Why Pydantic Settings?**

- Type-safe configuration
- Loads from `.env` automatically
- Easy to validate and defaults

**Key Settings:**

```python
OLLAMA_BASE_URL: str = "http://localhost:11434"
OLLAMA_MODEL: str = "mistral:3b-instruct-q4_K_M"
OLLAMA_TIMEOUT: int = 120

LLM_CONTEXT_LENGTH: int = 2048  # Max conversation history
LLM_TEMPERATURE: float = 0.7    # Response creativity (0-1)
LLM_MAX_TOKENS: int = 512       # Max response length
```

---

## Performance Considerations

### Phase 1 (Current)

**Bottleneck:** CPU-based LLM inference

**Metrics:**

- Response time: 5-10 seconds (Mistral 3B on i5-1155G7)
- Concurrent users: 1 (single-threaded LLM)
- Memory: ~6-8 GB during inference
- Model size: 3.8 GB disk, 6-8 GB RAM in use

**Optimization strategies:**

1. Response caching (repeat questions instant)
2. Cancel old requests if user sends new one
3. Use quantization (4-bit reduces size by 75%)
4. Streaming (show text as it generates)

### Phase 2-3 (Coming)

**New limiting factors:**

- Voice processing (but faster, GPU-accelerated)
- Avatar animation (GPU-accelerated)
- Real-time streaming

### Phase 5+ (Future)

**Potential optimizations:**

- GPU acceleration (5-10x speedup)
- Request batching (handle multiple conversations)
- Model quantization fine-tuning
- Caching layer (Redis)

---

## Security Considerations

**Current (Phase 1):**

- ✅ Everything local
- ✅ No internet required
- ✅ No external API calls
- ⚠️ No authentication (personal use only)
- ⚠️ No encryption (local machine only)

**Future (Phase 5+):**

- [ ] User authentication
- [ ] Conversation encryption
- [ ] Rate limiting
- [ ] Input validation (already done)

---

## Scalability

**Single Machine:** Works well with current design

**If expanding (future):**

- Move to microservices
- Separate LLM service (dedicated GPU server)
- Queue system (Bull/RabbitMQ) for jobs
- Caching layer (Redis)
- Load balancer (nginx)

---

## Testing Strategy

**Phase 1 (Manual):**

```bash
# Health check
curl http://localhost:8000/health

# Chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test via API docs
open http://localhost:8000/docs
```

**Phase 2 (Automated):**

- Unit tests for services
- Integration tests for API endpoints
- Load tests for performance

---

## Deployment Architecture

**Phase 1-5: Local Development**

```
Laptop Machine
├─ Ollama (port 11434)
├─ FastAPI Backend (port 8000)
├─ Next.js Dev Server (port 3000)
└─ Database (SQLite or local PostgreSQL)
```

**Phase 5+: Potential Production**

```
Local Machine (Desktop App)
├─ Embedded Tauri wrapper
├─ Embedded FastAPI backend
├─ Embedded Ollama
└─ Local database

OR Web Deployment (if desired later)
├─ Frontend: Vercel / Netlify
├─ Backend: Cloud server (AWS/GCP)
├─ Ollama: GPU server
└─ Database: Managed PostgreSQL
```

---

## Technology Rationale

### Why FastAPI?

- ✅ Async support (WebSockets, real-time)
- ✅ Built-in validation (Pydantic)
- ✅ Auto API documentation
- ✅ Modern Python (async/await)
- ✅ Easy deployment

### Why Ollama?

- ✅ Runs locally, no API key needed
- ✅ Simple HTTP API
- ✅ Model management built-in
- ✅ Quantization support (smaller models)
- ✅ Cross-platform

### Why LangChain?

- ✅ Memory management
- ✅ Prompt templating
- ✅ Multiple LLM support
- ✅ Tool/agent framework
- ✅ Community examples

### Why Next.js?

- ✅ Full-stack JavaScript
- ✅ Server Components (efficient)
- ✅ Built-in optimizations
- ✅ Easy deployment
- ✅ TypeScript support

### Why Tauri?

- ✅ Lightweight (10-30 MB vs 200+ MB Electron)
- ✅ Rust backend for performance
- ✅ System tray, file dialogs, etc.
- ✅ Cross-platform
- ✅ Smaller memory footprint

---

## Known Limitations (Phase 1)

| Limitation | Why | Plan |
|-----------|-----|------|
| Single conversation | Design choice | Phase 6: Add multi-conversation |
| No persistence | Simplified Phase 1 | Phase 2: Add database |
| No voice | Backend only | Phase 2: Add voice with Pipecat |
| No real-time streaming | Simpler API | Phase 2: Add WebSocket + streaming |
| Single user | Personal assistant | Phase 5+: Add auth if needed |

---

## Development Workflow

```
Implement Feature
    ↓
Edit code (services, main.py, etc.)
    ↓
Restart backend (auto-reload with --reload flag)
    ↓
Test via curl / API docs
    ↓
Update PHASE_STATUS.md
    ↓
Commit to git
    ↓
Next phase or next feature
```

---

## Future Phases Architecture Changes

### Phase 2: Voice

- Add Pipecat service
- Add WebSocket endpoint
- Add speech-to-text service
- Add text-to-speech service
- Modify main.py to include /ws/voice

### Phase 3: Avatar

- Add LivePortrait service
- Add video generation endpoint
- Video streaming to frontend

### Phase 4: Web Frontend

- Create Next.js app
- Build chat UI components
- Integrate with backend API
- WebSocket connection for voice

### Phase 5: Desktop

- Wrap frontend in Tauri
- Bundle backend inside
- System integration (tray, hotkeys)
- Multi-platform installers

---

See [PROJECT_PLAN.md](../PROJECT_PLAN.md) for more details on each phase.
