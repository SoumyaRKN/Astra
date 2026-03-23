# Astra

A fully local AI assistant with chat, voice, image generation, video generation, music, avatar animation, and model training. Everything runs on your machine — private, offline, no API keys needed.

## Features

- **Chat** — Conversations with a local LLM via Ollama
- **Voice Chat** — Speak and hear responses (Whisper + TTS)
- **Image Generation** — Text-to-image, image-to-image, and LoRA-trained generation (Stable Diffusion)
- **Video Generation** — Text-to-video and image-to-video
- **Music / Audio** — Generate soundtracks and enhance audio (MusicGen)
- **Avatar** — Upload a photo, detect face, generate animated avatar video
- **Training** — Fine-tune with LoRA on your own images for personalized generation
- **Gallery** — Browse all generated media
- **Memory** — Conversations remember context across messages
- **100% Private** — Nothing ever leaves your computer

## Quick Start

### 1. Prerequisites

- **Python 3.10+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Ollama** — Install with:

  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
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
├── backend/
│   ├── main.py              FastAPI app (all routes)
│   ├── llm.py               Ollama LLM integration
│   ├── memory.py            Chat history
│   ├── config.py            Settings
│   ├── database.py          SQLite setup
│   ├── models.py            Database models
│   ├── requirements.txt
│   └── services/
│       ├── stt.py           Speech-to-text (Whisper)
│       ├── tts.py           Text-to-speech
│       ├── voice.py         Voice chat pipeline
│       ├── image.py         Image generation (SD)
│       ├── video.py         Video generation
│       ├── audio.py         Audio/music generation
│       ├── avatar.py        Avatar animation
│       └── train.py         LoRA fine-tuning
├── frontend/
│   ├── src/app/             Pages (chat, voice, image, video, audio, avatar, train, gallery, settings)
│   ├── src/components/      Shared components (sidebar)
│   ├── src/lib/api.ts       API client
│   └── src/store/           Zustand state
├── storage/                 Generated media (auto-created)
├── setup.sh                 Install everything
├── run.sh                   Start Astra
└── .env                     Configuration
```

## Configuration

Edit `.env`:

```env
OLLAMA_MODEL=mistral        # AI model (try: llama3, gemma2, phi3)
LLM_TEMPERATURE=0.7         # Creativity (0.0 = precise, 1.0 = creative)
LLM_MAX_TOKENS=512          # Max response length
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System status |
| `/chat` | POST | Send a chat message |
| `/sessions` | GET | List chat sessions |
| `/history/{session}` | GET/DELETE | Chat history |
| `/voice` | POST | Voice chat (audio in → text + audio out) |
| `/voice/stt` | POST | Speech-to-text |
| `/voice/tts` | POST | Text-to-speech |
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
| `/avatar/animate` | POST | Animate avatar |
| `/train/upload` | POST | Upload training data |
| `/train/start` | POST | Start LoRA training |
| `/train/status/{id}` | GET | Training job status |
| `/train/models` | GET | List trained models |
| `/gallery/images` | GET | Generated images |
| `/gallery/videos` | GET | Generated videos |
| `/gallery/audio` | GET | Generated audio |
| `/docs` | GET | Interactive API docs |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| LLM | Ollama + Mistral |
| Backend | FastAPI (Python) |
| Frontend | Next.js 15 + React 19 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Database | SQLite |
| Images | Stable Diffusion (diffusers) |
| Video | ZeroScope / ModelScope |
| Music | MusicGen |
| Speech | Whisper (STT) + piper-tts (TTS) |
| Training | LoRA (PEFT) |
| Avatar | OpenCV + Pillow |

## License

MIT
