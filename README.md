# Astra

A fully local AI assistant with chat, voice, image generation, video generation, music, avatar animation, and model training. Everything runs on your machine — private, offline, no API keys needed.

## Features

- **Chat** — Conversations with a local LLM via Ollama, with memory across messages
- **Voice Chat** — Speak and hear responses (Whisper STT + TTS)
- **Image Generation** — Text-to-image, image-to-image, and LoRA-trained generation (Stable Diffusion)
- **Video Generation** — Text-to-video and image-to-video
- **Music / Audio** — Generate soundtracks and enhance audio (MusicGen)
- **Avatar** — Upload a photo, detect face, generate animated avatar with lip-sync
- **Training** — Fine-tune with LoRA on your own images for personalized generation
- **Gallery** — Browse all generated media (images, videos, audio)
- **Settings** — Theme toggle (light/dark/system), system status, session management
- **Theming** — Light, dark, and system-adaptive themes with smooth transitions
- **Memory** — Conversations remember context across messages
- **100% Private** — Nothing ever leaves your computer

## Quick Start

### 1. Prerequisites

- **Python 3.10+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Ollama** — Install with:

  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
  ollama pull mistral
  ```

### 2. Setup

```bash
cd Astra
./setup.sh
```

### 3. Run

```bash
./run.sh
```

Open **<http://localhost:3000>**

## Project Structure

```
Astra/
├── README.md                Project overview (this file)
├── GUIDE.md                 User guide
├── AGENT.md                 AI agent technical reference
├── .env                     Configuration
├── setup.sh                 Install everything
├── run.sh                   Start backend + frontend
├── LICENSE                  MIT
│
├── backend/
│   ├── main.py              FastAPI app — all routes
│   ├── config.py            Pydantic settings from .env
│   ├── llm.py               Ollama LLM integration
│   ├── memory.py            In-memory conversation history
│   ├── database.py          SQLAlchemy engine + init
│   ├── models.py            ORM models (Conversation, GeneratedMedia)
│   ├── requirements.txt     Python dependencies
│   ├── services/
│   │   ├── stt.py           Speech-to-text (Whisper)
│   │   ├── tts.py           Text-to-speech (piper/basic)
│   │   ├── voice.py         Voice chat pipeline (STT → LLM → TTS)
│   │   ├── image.py         Image generation (SD text2img, img2img, LoRA)
│   │   ├── video.py         Video generation (text2vid, img2vid)
│   │   ├── audio.py         Audio enhance + music generation
│   │   ├── avatar.py        Avatar upload, detect, animate
│   │   └── train.py         LoRA fine-tuning
│   └── storage/             Generated files (auto-created)
│
└── frontend/
    ├── package.json
    └── src/
        ├── app/
        │   ├── layout.tsx       Root layout (Sidebar + ThemeProvider)
        │   ├── globals.css      Theme system (CSS variables, dark/light, animations)
        │   ├── page.tsx         Chat page (home)
        │   ├── voice/page.tsx   Voice chat
        │   ├── image/page.tsx   Image generation (3 tabs)
        │   ├── video/page.tsx   Video generation (2 tabs)
        │   ├── audio/page.tsx   Music generation + audio enhance
        │   ├── avatar/page.tsx  Avatar upload + animate
        │   ├── train/page.tsx   LoRA training (upload, jobs, models)
        │   ├── gallery/page.tsx Media gallery (3 tabs)
        │   └── settings/page.tsx Theme, system status, sessions
        ├── components/
        │   ├── Sidebar.tsx      Desktop sidebar + mobile bottom nav with theme toggle
        │   └── ThemeProvider.tsx Theme lifecycle (localStorage, system preference listener)
        ├── lib/
        │   └── api.ts           API client (all backend endpoints)
        └── store/
            ├── chat.ts          Chat state (Zustand)
            └── theme.ts         Theme state — light/dark/system (Zustand)
```

## Configuration

Edit `.env`:

```env
OLLAMA_MODEL=mistral        # AI model (try: llama3, gemma2, phi3)
OLLAMA_URL=http://localhost:11434
LLM_TEMPERATURE=0.7         # Creativity (0.0 = precise, 1.0 = creative)
LLM_MAX_TOKENS=512          # Max response length
LLM_CONTEXT=2048            # Context window size
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System status |
| `/info` | GET | Full config info |
| `/chat` | POST | Send a chat message |
| `/sessions` | GET | List chat sessions |
| `/history/{session}` | GET/DELETE | Chat history |
| `/voice` | POST | Voice chat (audio in → text + audio out) |
| `/voice/stt` | POST | Speech-to-text only |
| `/voice/tts` | POST | Text-to-speech only |
| `/ws/voice` | WebSocket | Real-time voice chat |
| `/image/generate` | POST | Text-to-image |
| `/image/from-image` | POST | Image-to-image |
| `/image/from-trained` | POST | Generate from LoRA model |
| `/video/generate` | POST | Text-to-video |
| `/video/from-image` | POST | Image-to-video |
| `/audio/generate` | POST | Generate music |
| `/audio/enhance` | POST | Enhance audio |
| `/avatar/upload` | POST | Upload avatar photo |
| `/avatar/profile` | GET | Get avatar profile |
| `/avatar/animate` | POST | Animate avatar with lip-sync |
| `/train/upload` | POST | Upload training data |
| `/train/start` | POST | Start LoRA training |
| `/train/status/{id}` | GET | Training job status |
| `/train/jobs` | GET | All training jobs |
| `/train/models` | GET | List trained models |
| `/gallery/images` | GET | Generated images |
| `/gallery/videos` | GET | Generated videos |
| `/gallery/audio` | GET | Generated audio |
| `/docs` | GET | Interactive API docs (Swagger UI) |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| LLM | Ollama + Mistral |
| Backend | FastAPI (Python 3.10+) |
| Frontend | Next.js 15 + React 19 |
| Styling | Tailwind CSS 4 (CSS variables for theming) |
| State | Zustand 5 |
| Database | SQLite + SQLAlchemy 2.0 |
| Images | Stable Diffusion (diffusers) |
| Video | ZeroScope / ModelScope / SVD |
| Music | MusicGen (transformers) |
| Speech | Whisper (STT) + piper-tts (TTS) |
| Training | LoRA (PEFT) |
| Avatar | OpenCV + Pillow |
| Icons | Lucide React |

## License

MIT
