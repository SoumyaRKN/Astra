# 🚀 START HERE - Personal AI Assistant

> **For First-Time Users** - Read this guide if you're new to this project!

---

## 🎯 What is This?

**Personal AI Assistant** is like having your own AI friend that you can:

✅ **Chat with** - Talk to an AI that remembers your conversations  
✅ **Speak to** - Use your voice instead of typing  
✅ **See animated** - An avatar that talks back with lip-sync animations  
✅ **Create media** - Generate images, videos, and background music  
✅ **Customize** - Make it your own with personalized voices and styles  

---

## ⚡ 5-MINUTE QUICK START

### What You Need

- **Computer**: Windows, Mac, or Linux
- **Docker**: A tool that runs the app (like a container)
- **Space**: About 10GB free disk space
- **Internet**: For downloading files initially

### Step 1: Install Docker

<details>
<summary>🐳 <b>Click to see Docker installation</b></summary>

**Windows & Mac:**

1. Go to [docker.com](https://www.docker.com)
2. Download "Docker Desktop"
3. Run the installer
4. Restart your computer

**Linux:**

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y docker.io docker-compose

# Add yourself to docker group (so you don't need sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

</details>

### Step 2: Get & Start The Project

```bash
# 1. Go to project folder
cd "/home/nsoumyaprakash/Desktop/Personal/Projects/Personal Assistant"

# 2. Start everything with one command
bash scripts/deploy-local.sh

# Wait 2-3 minutes for everything to start...
# You'll see green checkmarks when it's ready

# 3. Open in your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Step 3: Start Using It

1. Go to `http://localhost:3000` in your browser
2. Type a message or click the microphone to speak
3. Watch the AI avatar respond with animations and voice!

---

## 🎮 Basic Usage

### Chat with AI

1. **Type a message** - Type what you want to ask
2. **Or speak** - Click the microphone button and speak
3. **Get response** - AI responds with text, voice, and avatar animation

### Generate Images/Videos

1. Go to the **Media** section
2. Describe what you want
3. Click **"Generate Image"** or **"Generate Video"**
4. Wait for creation (takes 10-60 seconds)
5. See result in your gallery

### Customize Settings

1. Click **Settings** button
2. Choose:
   - **AI Model** - What AI brain to use (Llama, Mistral, etc.)
   - **Voice** - How the avatar sounds
   - **Avatar Style** - How it looks (3D, 2D, Cartoon, etc.)
   - **Theme** - Light or dark mode

---

## 🆘 Troubleshooting for Beginners

### "Docker is not installed"

**Solution**: Go to [docker.com](https://www.docker.com) and download Docker Desktop

### "Permission denied" Error

**Solution**: Add yourself to Docker group (Linux only):

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Services not starting / Stuck

**Solution**:

```bash
# Stop everything
docker compose down

# Clean up
docker system prune -a

# Start again
bash scripts/deploy-local.sh
```

### Can't connect to <http://localhost:3000>

**Solution**:

1. Wait 2-3 minutes - services need time to start
2. Check if Docker is running: `docker ps`
3. View logs: `docker compose logs -f`
4. Restart: `docker compose restart`

### AI responses are slow

**Solution**: This is normal!

- First response takes 10-30 seconds (model loading)
- Subsequent responses are faster (3-10 seconds)
- Patience! ⏳

### Out of disk space

**Solution**: Video generation uses space. Clean up:

```bash
# Remove old generated media
docker system prune

# Or delete local videos/images manually from browser
```

---

## 📚 What to Read Next

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands and shortcuts
- **[USER_GUIDE.md](USER_GUIDE.md)** - Detailed feature explanation
- **[README.md](README.md)** - Full project overview
- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)** - Make AI respond YOUR way

---

## 🚀 Common Tasks

### Change the AI Model

1. Go to Settings
2. Look for "LLM Model"
3. Choose from list (Llama, Mistral, GPT, etc.)
4. Click Save
5. Done! Next conversations use new model

### Use Your Own Voice

1. Go to Settings > Voice
2. Click "Clone Voice"
3. Record 5-10 seconds of yourself speaking
4. Click "Train"
5. Your voice is now available!

### Download Generated Media

1. Go to Media Gallery
2. Find what you want (image, video, etc.)
3. Click the download button
4. It goes to your Downloads folder

### Clear Chat History

1. Open a conversation
2. Click the **trash** icon
3. Confirm deletion
4. Chat history is gone

---

## 💡 Tips & Tricks

✅ **Ask follow-up questions** - AI remembers context  
✅ **Be specific** - "Show me a sunset over water" works better than "show me sunset"  
✅ **Use voice** - Feels more natural than typing  
✅ **Customize avatar** - Make it look like you!  
✅ **Check the logs** - If something fails, `docker compose logs -f` shows why  

---

## 🔧 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4GB | 8GB+ |
| **Disk** | 20GB | 50GB+ |
| **GPU** | Not needed | NVIDIA (faster)|
| **Internet** | Initial setup | Fast for media gen |

---

## ❓ More Help?

- Is something not working? Check **[PRODUCTION_SECURITY.md](PRODUCTION_SECURITY.md)** for troubleshooting
- Want to understand everything? Read **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** (technical guide)
- Need details on features? See **[USER_GUIDE.md](USER_GUIDE.md)**

---

## 🎉 You're Ready

```bash
# Run this command to start
bash scripts/deploy-local.sh

# Then visit: http://localhost:3000
# And enjoy your Personal AI Assistant! 🤖
```

---

**Questions?** Check the guides above or look at the logs:

```bash
docker compose logs -f
```

**Enjoy!** 🚀
