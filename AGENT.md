# Astra — AI Agent Reference

Complete reference for any AI agent to understand and work on the Astra project.

---

## Project Summary

**Astra** is a local AI assistant with chat, voice, image/video/music generation, avatar animation, and LoRA training. Personal single-user project — no auth, no Docker, no cloud.

---

## Architecture

```
Browser (localhost:3000)
  ↓ HTTP/WebSocket
Next.js 15 Frontend (React 19, Tailwind 4, Zustand 5)
  ↓ fetch() to localhost:8000
FastAPI Backend (Python, async)
  ├── LLM → Ollama (localhost:11434)
  ├── STT → Whisper
  ├── TTS → piper-tts / basic
  ├── Image Gen → Stable Diffusion (diffusers)
  ├── Video Gen → ZeroScope / SVD
  ├── Music Gen → MusicGen
  ├── Avatar → OpenCV + Pillow
  ├── Training → LoRA (PEFT)
  ├── Memory → In-memory conversation store
  └── Database → SQLite (astra.db)
```

---

## File Map

```
Astra/
├── .env                    # Configuration
├── setup.sh                # Install dependencies
├── run.sh                  # Start backend + frontend
├── README.md               # Overview
├── GUIDE.md                # User guide
├── AGENT.md                # This file
│
├── backend/
│   ├── main.py             # FastAPI app — ALL routes (chat, voice, image, video, audio, avatar, train, gallery)
│   ├── config.py           # Pydantic settings from .env
│   ├── llm.py              # Ollama LLM integration
│   ├── memory.py           # In-memory conversation history
│   ├── database.py         # SQLAlchemy engine, init
│   ├── models.py           # ORM models (Conversation, GeneratedMedia)
│   ├── requirements.txt    # Python deps (core + ML)
│   ├── services/
│   │   ├── __init__.py     # Lazy exports
│   │   ├── stt.py          # Speech-to-text (Whisper)
│   │   ├── tts.py          # Text-to-speech (piper/basic)
│   │   ├── voice.py        # Voice pipeline (STT→LLM→TTS)
│   │   ├── image.py        # Image gen (text2img, img2img, LoRA)
│   │   ├── video.py        # Video gen (text2vid, img2vid)
│   │   ├── audio.py        # Audio enhance + music gen
│   │   ├── avatar.py       # Avatar upload/detect/animate
│   │   └── train.py        # LoRA fine-tuning
│   └── storage/            # Generated files (auto-created)
│
└── frontend/
    ├── package.json
    ├── next.config.mjs
    └── src/
        ├── app/
        │   ├── layout.tsx       # Root layout with Sidebar
        │   ├── page.tsx         # Chat page
        │   ├── globals.css      # Theme + animations
        │   ├── voice/page.tsx   # Voice chat
        │   ├── image/page.tsx   # Image gen (3 tabs)
        │   ├── video/page.tsx   # Video gen (2 tabs)
        │   ├── audio/page.tsx   # Music gen + enhance
        │   ├── avatar/page.tsx  # Avatar upload/animate
        │   ├── train/page.tsx   # LoRA training
        │   ├── gallery/page.tsx # Browse media (3 tabs)
        │   └── settings/page.tsx # System config
        ├── components/
        │   └── Sidebar.tsx      # Icon sidebar navigation
        ├── lib/
        │   └── api.ts           # All API functions
        └── store/
            └── chat.ts          # Chat state
```

---

## API Routes

### Core

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Welcome + feature list |
| GET | `/health` | Ollama status |
| GET | `/info` | Full config info |

### Chat

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/chat` | Send message → get response |
| GET | `/sessions` | List sessions |
| GET/DELETE | `/history/{session}` | Get/clear history |

### Voice

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/voice` | Voice chat (audio in → text + response) |
| POST | `/voice/stt` | Speech-to-text |
| POST | `/voice/tts` | Text-to-speech |
| WS | `/ws/voice` | Real-time voice |

### Image

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/image/generate` | Text-to-image |
| POST | `/image/from-image` | Image-to-image |
| POST | `/image/from-trained` | Generate from LoRA |

### Video

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/video/generate` | Text-to-video |
| POST | `/video/from-image` | Image-to-video |

### Audio

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/audio/generate` | Generate music |
| POST | `/audio/enhance` | Enhance audio |

### Avatar

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/avatar/upload` | Upload face photo |
| GET | `/avatar/profile` | Get profile |
| POST | `/avatar/animate` | Generate animation |

### Training

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/train/upload` | Upload training images |
| POST | `/train/start` | Start LoRA fine-tuning |
| GET | `/train/status/{id}` | Job progress |
| GET | `/train/jobs` | All jobs |
| GET | `/train/models` | Trained models |

### Gallery

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/gallery/images` | List images |
| GET | `/gallery/videos` | List videos |
| GET | `/gallery/audio` | List audio |

---

## Key Design Decisions

1. **Single-file services** — Each service is one file with a lazy singleton.
2. **Lazy loading** — ML models only load when first used (saves memory).
3. **No auth** — Personal project.
4. **No Docker** — Runs on host.
5. **SQLite** — Zero-config database.
6. **Storage dir** — All generated media saved to `backend/storage/`.
7. **Services imported lazily** in routes — avoids loading torch at startup.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| LLM | Ollama + Mistral |
| Backend | FastAPI 0.115 |
| Frontend | Next.js 15 + React 19 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Images | Stable Diffusion (diffusers) |
| Video | ZeroScope / SVD |
| Music | MusicGen (transformers) |
| Speech | Whisper + piper-tts |
| Training | LoRA (PEFT) |
| Avatar | OpenCV + Pillow |
| Database | SQLite + SQLAlchemy 2.0 |

---

## Patterns

### Backend: Lazy singleton service

```python
_service = None
def get_service():
    global _service
    if _service is None:
        _service = ServiceClass()
    return _service
```

### Backend: Lazy import in route

```python
@app.post("/endpoint")
async def handler():
    from services.thing import get_thing
    svc = get_thing()
    return svc.do_work()
```

### Frontend: API call

```typescript
export const doThing = (param: string) =>
    post("/endpoint", { param });
```

### Frontend: File upload

```typescript
export async function uploadThing(file: File) {
    const form = new FormData();
    form.append("file", file);
    return postForm("/endpoint", form);
}
```

---

## Development

```bash
# Backend only
cd backend && source venv/bin/activate && python main.py

# Frontend only
cd frontend && npm run dev

# Both
./run.sh
```

---

## Future Ideas

- Stream chat responses (SSE)
- Model switching from UI
- Conversation persistence to SQLite
- Theme customization
- Export/import chat history
- Real-time video generation progress
