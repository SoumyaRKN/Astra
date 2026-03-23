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
- **Avatar** — Upload a photo and animate it
- **Train** — Fine-tune the AI on your own images for personalized generation
- **Gallery** — Browse everything you've created

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

## Features

### Chat

Type a message and press Enter. The AI will respond using context from the conversation. Click suggestions at the start or type anything.

### Voice Chat

Navigate to the **Voice** tab in the sidebar. Hold the microphone button, speak, and release. Astra transcribes your speech, generates a response, and reads it back.

**Requirements:** Microphone access in your browser.

### Image Generation

Navigate to the **Image** tab. Three modes:

- **Text to Image** — Describe what you want ("a red fox in a forest")
- **Image to Image** — Upload a source image and modify it with a prompt
- **From Trained** — Use a LoRA model you've trained on your own data

Choose a Stable Diffusion model, adjust steps, and generate.

### Video Generation

Navigate to the **Video** tab. Two modes:

- **Text to Video** — Describe a scene to generate a short video clip
- **Image to Video** — Upload an image and animate it

### Audio / Music

Navigate to the **Audio** tab. Two modes:

- **Generate Music** — Describe a soundtrack ("calm ambient piano") and set duration
- **Enhance Audio** — Upload an audio file to reduce noise and normalize volume

### Avatar

Navigate to the **Avatar** tab:

1. Upload a photo of a face
2. Astra detects the face automatically
3. Enter text and duration to generate an animated avatar video with basic lip-sync

### Training

Navigate to the **Train** tab to fine-tune the AI on your data:

1. **Upload Data** — Upload at least 3 images of a subject
2. **Configure** — Set a model name, trigger word, and training steps
3. **Start Training** — LoRA fine-tuning runs in the background
4. **Use the Model** — Go to Image → "From Trained" and generate with your trained model

### Gallery

Navigate to the **Gallery** tab to browse all generated images, videos, and audio files. Download or play them directly.

### Settings

Navigate to the **Settings** tab to see:

- System status (Ollama connection, model info)
- LLM configuration
- Active features
- Chat sessions (with option to clear)

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
LLM_TEMPERATURE=0.7           # 0.0 = factual, 1.0 = creative
LLM_MAX_TOKENS=512            # Max response length
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

---

## How It Works

```
Browser → Next.js → FastAPI → Service (Ollama/Whisper/SD/etc.) → Response → Browser
```

Everything runs locally. No data leaves your machine.

---

## Getting Help

- **API docs:** <http://localhost:8000/docs>
- **Health check:** <http://localhost:8000/health>
- **Ollama docs:** [ollama.ai](https://ollama.ai)
