# 📖 BEGINNER'S COMPLETE GUIDE

> This guide explains EVERYTHING in simple English. No technical knowledge required!

---

## 📑 TABLE OF CONTENTS

1. [What is This Project?](#what-is-this-project)
2. [Getting Started](#getting-started)
3. [How to Use It](#how-to-use-it)
4. [Understanding the Pieces](#understanding-the-pieces)
5. [Troubleshooting](#troubleshooting)
6. [Common Questions](#common-questions)

---

## 🎯 What is This Project?

### The Simple Answer

It's a **Personal AI Assistant** - like Siri or Alexa, but one you can customize and run on your own computer!

### What Can It Do?

```
USER                          PERSONAL AI ASSISTANT
  │                                    │
  ├─ "Hello!" ────────────────────→ Responds with text & voice ━━━━┓
  │                                                                 │
  ├─ *speaks into microphone* ────→ Understands & talks back ━━━━┓
  │                                 with lip-sync avatar         │
  │                                                              │
  ├─ "Make an image of..." ───────→ Generates AI image ━━━━━┓
  │                                                         │
  ├─ "Create a video..." ─────────→ Creates AI video ━━━━━┓
  │                                                        │
  └─ "Generate music..." ─────────→ Makes background music ┘

All of this remembers your past conversations!
```

### Key Features

| Feature | What It Means | Example |
|---------|---------------|---------|
| **Chat** | Talk back and forth | Ask "What's the weather?" |
| **Voice** | Speak instead of type | Say "Tell me a joke" |
| **Avatar** | See the AI respond | Watch animated character talk |
| **Media** | Create images/videos | "Draw me a sunset" |
| **Memory** | Remembers context | References previous messages |
| **Customization** | Make it yours | Change voice, avatar, personality |

---

## 🚀 GETTING STARTED

### Part 1: Install Docker (Required)

**What is Docker?**  
Think of Docker like a container that runs the app safely and the same way on any computer.

<details>
<summary><b>👇 Click to see installation steps</b></summary>

#### Windows Users

1. Go to [docker.com/products/docker-desktop](https://docker.com/products/docker-desktop)
2. Click "Download for Windows"
3. Run the downloaded file
4. Follow the installer (just click "Next" and "Install")
5. Restart your computer when asked
6. Done! ✅

#### Mac Users

1. Go to [docker.com/products/docker-desktop](https://docker.com/products/docker-desktop)
2. Choose your Mac type (Intel or Apple Silicon)
3. Download the file
4. Run the installer
5. Follow instructions
6. Restart when asked

#### Linux Users

Copy and paste this into your terminal:

```bash
# Update system
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Add yourself to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Apply changes immediately
newgrp docker

# Test it works
docker --version
```

</details>

### Part 2: Start the Project (One Command!)

<details>
<summary><b>🔧 Click for step-by-step</b></summary>

1. **Open Terminal/Command Prompt**
   - Windows: `Win + R`, type `cmd`
   - Mac: `Cmd + Space`, type `terminal`
   - Linux: `Ctrl + Alt + T`

2. **Go to the project folder**

   ```bash
   cd "/home/nsoumyaprakash/Desktop/Personal/Projects/Personal Assistant"
   ```

3. **Run the magic command**

   ```bash
   bash scripts/deploy-local.sh
   ```

4. **Wait for completion** (2-5 minutes)
   - You'll see green checkmarks ✅ when services start
   - It's downloading and setting things up

5. **Open in your browser**
   - Frontend (the app): [http://localhost:3000](http://localhost:3000)
   - Backend (the engine): [http://localhost:8000](http://localhost:8000)
   - API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

🎉 **Done! You can now use your Personal AI Assistant!**

</details>

---

## 💬 HOW TO USE IT

### Basic Chat (Text)

1. Open [http://localhost:3000](http://localhost:3000) in browser
2. See a chat box at the bottom
3. Type your message: "Hello, how are you?"
4. Press Enter or click Send
5. AI responds! ✨

### Using Your Voice

1. Click the **Microphone** 🎤 button
2. Speak clearly
3. Click the button again to stop recording
4. AI listens and responds

### Generate Images

1. Click the **"Media"** or **"Create"** button
2. Type what you want: "A sunset over mountains"
3. Click **"Generate Image"**
4. Wait 20-60 seconds
5. See your AI-created image! 🎨

### Generate Videos

1. Go to Media section
2. Type what you want: "A robot dancing"
3. Click **"Generate Video"**
4. Wait 2-5 minutes (takes longer!)
5. Watch your creation! 🎬

### Settings (Customize)

Click the **Settings** ⚙️ button to:

- Change AI model (Llama, Mistral, etc.)
- Choose voice (male, female, different languages)
- Change avatar appearance
- Switch between light/dark theme
- Adjust AI behavior (temperature, response length)

### Saving Your Work

- **Chat history** - Saved automatically
- **Generated images** - Click download button
- **Generated videos** - Click download button
- **Settings** - Saved when you click "Save"

---

## 🏗️ UNDERSTANDING THE PIECES

### Simple System Overview

Think of it like a restaurant:

```
┌─────────────────────────────────────┐
│         YOU (User)                  │
│    Browser on port 3000             │
│    (The Counter where you order)    │
└──────────────┬──────────────────────┘
               │
        (You place order)
               │
┌──────────────▼──────────────────────┐
│        FRONTEND (Next.js)           │
│    (The menu and order form)        │
└──────────────┬──────────────────────┘
               │
      (Order goes to kitchen)
               │
┌──────────────▼──────────────────────┐
│   BACKEND (FastAPI on port 8000)    │
│    (The Kitchen - processes orders) │
│                                     │
│  Uses:                              │
│  - Ollama (AI model)                │
│  - Database (memory)                │
│  - Services (voice, video, etc.)    │
└──────────────┬──────────────────────┘
               │
      (Prepared food returns)
               │
┌──────────────▼──────────────────────┐
│        YOU (Get Result)             │
│   See response/image/video          │
│   Listen to AI voice                │
│   Watch avatar animation            │
└─────────────────────────────────────┘
```

### The Three Main Parts

#### 1. **Frontend** (The Interface)

- What you see and interact with
- Built with React and Next.js
- Located at: `http://localhost:3000`
- You type here, you see results here

#### 2. **Backend** (The Brain)

- Does all the thinking
- Runs the AI models
- Handles data
- Located at: `http://localhost:8000`
- You don't directly use it, but it powers everything

#### 3. **Database** (The Memory)

- Stores your conversations
- Stores user settings
- Saves generated images/videos info
- Located inside Docker
- You never directly access it

### What Services Do

| Service | Purpose | Example |
|---------|---------|---------|
| **LLM** | Main AI that talks | Understands your question |
| **STT** | Hears what you say | "Speech to Text" |
| **TTS** | Speaks responses | "Text to Speech" |
| **Avatar** | Shows animated character | 3D face that talks |
| **LipSync** | Makes mouth move right | Avatar speaks with correct mouth movements |
| **Image Gen** | Creates images from text | "Draw a cat" → image |
| **Video Gen** | Creates videos | "Animate a robot" → video |
| **Ollama** | Local AI models | The actual AI running |

---

## 🆘 TROUBLESHOOTING

### Problem: "Docker is not installed"

**What it means**: Your computer doesn't have Docker  
**Fix**: Install Docker from [docker.com](https://docker.com)

---

### Problem: "Permission denied" (Linux only)

**What it means**: You can't run Docker commands  
**Fix**:

```bash
sudo usermod -aG docker $USER
newgrp docker
# Then try again
```

---

### Problem: Services won't start / Stuck

**What it means**: Something is stuck during startup  
**Fix**:

```bash
# Stop everything
docker compose down

# Clean everything
docker system prune -a

# Start fresh
bash scripts/deploy-local.sh
```

---

### Problem: Can't open <http://localhost:3000>

**What it means**: Frontend isn't running yet  
**Fix**:

1. Wait 3-5 minutes (it's starting up)
2. Check if Docker is running: `docker ps`
3. See logs: `docker compose logs -f`
4. Restart: `docker compose restart`

---

### Problem: "AI is too slow"

**What it means**: Responses take a long time  
**Why**: First response loads model (~10-30 seconds). Subsequent are faster (~3-10 seconds)  
**Normal**: Yes, this is expected! 😊

---

### Problem: "Out of memory" or "Out of disk space"

**What it means**: Computer is full  
**Fix**:

```bash
# See what Docker takes up
docker system df

# Clean up old images
docker system prune -a

# Or delete generated media from the app
```

---

### Problem: "Backend says 'database not ready'"

**What it means**: Database is starting but not ready yet  
**Fix**: Just wait 1-2 minutes, then refresh browser

---

### Problem: Videos take forever to generate

**What it means**: Video generation is computationally heavy  
**Normal**: Yes! Videos take 2-10 minutes  
**Tip**: Don't close the browser/computer while it's generating

---

## ❓ COMMON QUESTIONS

### Q: Is my data private?

**A**: Yes! Everything runs on YOUR computer. No data goes to external servers (unless you configure it to). Your conversations, generated images, everything stays local.

---

### Q: Can I customize the AI?

**A**: Yes! Go to Settings to:

- Change which AI model it uses
- Add your own voice
- Customize avatar appearance
- Adjust AI behavior

---

### Q: Can I use my own AI model?

**A**: Yes! Go to backend/config.py and change:

```
OLLAMA_MODEL = "your-model-name"
```

Available models at: [ollama.ai/library](https://ollama.ai/library)

---

### Q: Can I make it remember things longer?

**A**: Yes. In .env.local, change:

```
LLM_CONTEXT_LENGTH=2048  # Higher number = longer memory, slower
```

---

### Q: Can I generate images better/faster?

**A**:

- **Better**: Describe more specifically
- **Faster**: Use smaller resolution (it's in Settings)
- **Smarter prompts**: "A professional photo of a sunset" beats "sunset"

---

### Q: How do I back up my data?

**A**:

1. Stop the app: `docker compose down`
2. Copy the database folder: `docker volume ls` to find it
3. Or export it: `docker exec personal-ai-db pg_dump -U personal_ai personal_assistant > backup.sql`

---

### Q: My computer is old/slow. Will it work?

**A**: It should work, but:

- Uses more CPU/memory
- Responses will be slower
- Video generation might not work well

Minimum: 4GB RAM, 2 cores CPU  
Recommended: 8GB RAM, 4 cores CPU, 50GB disk

---

### Q: Can I use this on my phone?

**A**: Not yet, but planned for Phase 8! For now, you need a computer.

---

### Q: Can I share this with others?

**A**: Yes! Others can:

1. Install Docker
2. Clone the same setup
3. Run on their computer

Or you could host it on a server for multiple users (advanced).

---

### Q: Do I need internet?

**A**:

- For **setup**: Yes (to download Docker, models, etc.)
- For **using it**: No! It runs locally. You only need the models downloaded.

---

### Q: Dumb question: What if I just want to chat?

**A**: That's the whole point! 😊 Just open the app and start typing. You don't need to generate images/videos if you don't want to.

---

## 📚 NEXT STEPS

### To Learn More

- **[START_HERE.md](START_HERE.md)** - Quick start guide
- **[USER_GUIDE.md](USER_GUIDE.md)** - Detailed features
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands
- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)** - Customize AI
- **[README.md](README.md)** - Full project info

### To Customize

1. Go to `backend/config.py` to change settings
2. Go to `.env.local` to change environment variables
3. Go to `frontend/src/` to modify the interface

### To Get Help

- Check this guide again
- Check the logs: `docker compose logs -f`
- Re-read the error message carefully
- Try restarting: `docker compose down && docker compose up -d`

---

## 🎉 THAT'S IT

You now understand the basics! Go have fun with your Personal AI Assistant! 🤖

**Start using it:**

```bash
# From the project folder:
bash scripts/deploy-local.sh

# Then open:
# http://localhost:3000
```

**Any questions?** Check the troubleshooting section or re-read the relevant section above.

---

*Happy chatting!* 💬✨
