# Astra — Complete Guide

Welcome! This guide explains everything about Astra in simple, clear language.

---

## What is Astra?

Astra is your personal AI assistant that runs entirely on your computer. It can:

- **Chat** — Have conversations with a local AI
- **Voice Chat** — Speak to the AI and hear responses
- **Generate Images** — Create images from text descriptions
- **Generate Videos** — Create videos from text or images
- **Generate Music** — Create soundtracks and enhance audio
- **Avatar** — Upload a photo and animate it with lip-sync
- **Train** — Fine-tune the AI on your own images for personalized generation
- **Gallery** — Browse everything you've created
- **Settings** — Manage themes, view system status, and clear sessions

Everything is 100% private and runs offline.

---

## Setup

### Prerequisites

- **Python 3.10+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Ollama** — `curl -fsSL https://ollama.ai/install.sh | sh`

### Install & Run

```bash
cd Astra
./setup.sh      # Install everything (one time)
./run.sh         # Start Astra
```

Open **<http://localhost:3000>**

To stop: press `Ctrl+C`.

---

## Navigation

Astra uses a sidebar on desktop (left side with icons) and a bottom navigation bar on mobile.

**Desktop sidebar** — 9 items: Chat, Voice, Image, Video, Audio, Avatar, Train, Gallery, Settings. A theme toggle button sits above the version number at the bottom.

**Mobile bottom nav** — Shows the first 4 items (Chat, Voice, Image, Video) plus a "More" button. Tapping "More" opens a slide-up sheet with the remaining pages (Audio, Avatar, Train, Gallery, Settings) and theme options.

---

## Features

### Chat

Type a message and press Enter (or click the send button). The AI responds using context from the conversation. Quick-start suggestions appear when the chat is empty.

The status indicator at the top right shows whether the backend is connected (green dot = online, red dot = offline).

### Voice Chat

Navigate to the **Voice** tab. Hold the microphone button, speak, and release. Astra transcribes your speech, generates a response, and reads it back to you.

**Requirements:** Microphone access in your browser.

### Image Generation

Navigate to the **Image** tab. Three modes available via tabs:

- **Text to Image** — Describe what you want ("a red fox in a forest"), choose a model (SD 1.5, 2.1, SDXL, SDXL Turbo), and adjust steps
- **Image to Image** — Upload a source image, add a prompt, and adjust transformation strength
- **From Trained** — Use a LoRA model you've trained, with a trigger word

### Video Generation

Navigate to the **Video** tab. Two modes:

- **Text to Video** — Describe a scene, choose a model (Zeroscope, ModelScope, SVD), set frame count
- **Image to Video** — Upload an image and animate it into a video

### Audio / Music

Navigate to the **Audio** tab. Two modes:

- **Generate Music** — Describe a soundtrack ("calm ambient piano") and set duration (5–60 seconds)
- **Enhance Audio** — Upload an audio file to reduce noise and normalize volume

### Avatar

Navigate to the **Avatar** tab:

1. Upload a photo of a face (click the camera icon on the avatar circle)
2. Astra detects the face automatically
3. Enter text and click "Animate" to generate an animated avatar video with lip-sync

### Training

Navigate to the **Train** tab to fine-tune the AI on your data:

1. **Upload Data** — Upload at least 3 images of a subject (Step 1 card)
2. **Configure** — Set a model name and training steps (Step 2 card, unlocks after upload)
3. **Start Training** — LoRA fine-tuning runs in the background
4. **Check Jobs** — Switch to the "Jobs" tab to see progress
5. **View Models** — Switch to the "Models" tab to see completed models
6. **Use the Model** — Go to Image → "From Trained" and generate with your trained model

### Gallery

Navigate to the **Gallery** tab to browse all generated media. Three tabs:

- **Images** — Grid view with hover overlay for download
- **Videos** — Card view with inline playback
- **Audio** — List view with inline audio player

### Settings

Navigate to the **Settings** tab:

- **Appearance** — Choose Light, Dark, or System theme. Changes apply instantly with smooth transitions
- **System Status** — See backend connection status, LLM model name, version, and API endpoint
- **Chat Sessions** — View active sessions and clear individual conversation histories
- **About** — Project information

---

## Theme / Appearance

Astra supports three theme modes:

- **Light** — Clean light backgrounds with dark text
- **Dark** — Deep dark backgrounds with light text (default)
- **System** — Automatically follows your operating system's theme preference

You can switch themes in two places:

1. **Settings page** → Appearance section (large visual cards)
2. **Sidebar** → Theme toggle button (desktop: bottom of sidebar; mobile: More sheet)

The theme persists across browser sessions via localStorage.

---

## Changing the AI Model

Edit `.env`:

```env
OLLAMA_MODEL=llama3    # or: mistral, gemma2, phi3, codellama
```

Pull the model first: `ollama pull llama3`

| Model | Size | Best For |
|-------|------|----------|
| `mistral` | 4GB | General use (default) |
| `llama3` | 4.7GB | Reasoning |
| `gemma2` | 5.4GB | Instructions |
| `phi3` | 2.2GB | Fast, lightweight |
| `codellama` | 3.8GB | Programming |

---

## Configuration

Edit `.env`:

```env
OLLAMA_MODEL=mistral          # AI model
OLLAMA_URL=http://localhost:11434
OLLAMA_TIMEOUT=120            # Seconds to wait for Ollama
LLM_TEMPERATURE=0.7           # 0.0 = factual, 1.0 = creative
LLM_MAX_TOKENS=512            # Max response length
LLM_TOP_P=0.9                 # Nucleus sampling
LLM_CONTEXT=2048              # Context window
HOST=127.0.0.1
PORT=8000
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Ollama not running | `ollama serve` |
| Model not found | `ollama pull mistral` |
| Frontend won't start | `cd frontend && npm install` |
| Backend won't start | `cd backend && source venv/bin/activate && pip install -r requirements.txt` |
| Slow responses | Use smaller model (`phi3`), lower `LLM_MAX_TOKENS` |
| Port in use | Change PORT in `.env` or kill the process using the port |
| Image/video gen fails | Install ML deps: `pip install torch diffusers transformers` |
| Theme not changing | Clear localStorage in browser DevTools, or hard refresh |
| Backend shows disconnected | Ensure `python main.py` is running in `backend/` with venv active |

---

## How It Works

```
Browser (localhost:3000)
  ↓ HTTP / WebSocket
Next.js 15 Frontend (React 19, Tailwind CSS 4, Zustand)
  ↓ fetch() / WebSocket
FastAPI Backend (localhost:8000)
  ├── Ollama LLM (chat, reasoning)
  ├── Whisper (speech-to-text)
  ├── piper-tts (text-to-speech)
  ├── Stable Diffusion (image generation)
  ├── ZeroScope / SVD (video generation)
  ├── MusicGen (music generation)
  ├── OpenCV + Pillow (avatar)
  ├── LoRA / PEFT (training)
  └── SQLite (data persistence)
```

Everything runs locally. No data leaves your machine.

---

## Getting Help

- **API docs:** <http://localhost:8000/docs> (interactive Swagger UI)
- **Health check:** <http://localhost:8000/health>
- **System info:** <http://localhost:8000/info>
- **Ollama docs:** [ollama.ai](https://ollama.ai)
