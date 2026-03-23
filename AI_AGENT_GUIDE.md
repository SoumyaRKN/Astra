# 🤖 AI AGENT GUIDE - Personal AI Assistant Project

**Complete Project Documentation for AI Agents & Developers**

> **Purpose**: This document provides comprehensive project knowledge for AI agents and developers who need to understand, maintain, or extend this project. Read this to gain complete understanding of architecture, codebase, and development workflows.

---

## ⚡ LATEST UPDATES & VERSIONS (March 23, 2026)

### Environment & Infrastructure

- ✅ Docker Compose v5.1+ (removed deprecated `version` attribute)
- ✅ Python 3.11+ with FastAPI latest
- ✅ Node.js 18+ with Next.js 14+
- ✅ PostgreSQL 15-alpine (lean, fast)
- ✅ Ollama latest with multiple model support

### Recent Fixes & Improvements

- ✅ Fixed and optimized deployment scripts (deploy-local.sh, deploy-production.sh)
- ✅ Enhanced .env.example and .env.production templates with detailed comments
- ✅ Improved Docker error handling and permission checks
- ✅ Added comprehensive beginner guides (START_HERE.md, BEGINNER_GUIDE.md)
- ✅ Streamlined project structure (removed development-only artifacts)
- ✅ Added Docker permission troubleshooting

### For AI Agents Approaching This Codebase

**Start Here** (in this order):

1. Read this AI_AGENT_GUIDE completely
2. Understand the Architecture Diagram (section 3)
3. Examine Project Structure (section 4)
4. Study Backend System (section 5)
5. Study Frontend System (section 6)
6. Read Common Development Tasks (section 13)

**Key Principles**:

- Modularity: Each service is independent and reusable
- Async-first: Use async/await throughout
- Type safety: All Python code uses Pydantic, all TS uses TypeScript
- Error handling: Graceful degradation with proper logging
- Testing: Write tests for all new services/endpoints

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Project Structure](#project-structure)
5. [Backend System](#backend-system)
6. [Frontend System](#frontend-system)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [AI Services](#ai-services)
10. [Configuration & Environment](#configuration--environment)
11. [Development Workflow](#development-workflow)
12. [Deployment Infrastructure](#deployment-infrastructure)
13. [Common Development Tasks](#common-development-tasks)
14. [Testing Strategy](#testing-strategy)
15. [Troubleshooting](#troubleshooting)
16. [Future Roadmap](#future-roadmap)

---

## 🎯 PROJECT OVERVIEW

### What is This Project?

**Personal AI Assistant** is a comprehensive, full-stack AI-powered conversational application that combines:

- **Multi-modal AI Conversations** - Chat with an AI that understands context and remembers conversations
- **Voice Interaction** - Speak to the AI and listen to responses (STT/TTS)
- **Avatar Representation** - Animated 3D avatar that responds with lip-sync
- **Media Generation** - Create images, videos, and soundtracks via AI
- **Knowledge Integration** - Use custom knowledge bases and trained models
- **Voice Cloning** - Clone and customize voice output
- **Audio Enhancement** - Real-time audio processing and enhancement

### Project Statistics

- **Total Implementation**: 7 complete phases (100% complete)
- **Backend**: 20+ Python files, 13 specialized AI services
- **Frontend**: 25+ React/TypeScript files, modern UI components
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Deployment**: Full Docker containerization, CI/CD pipelines
- **Documentation**: 9 comprehensive guides

### Core Features (Phase 1-7)

| Phase | Feature | Status |
|-------|---------|--------|
| **Phase 1** | Basic chat infrastructure | ✅ Complete |
| **Phase 2** | Voice interaction (STT/TTS) | ✅ Complete |
| **Phase 3** | Avatar system with lip-sync | ✅ Complete |
| **Phase 4** | Image & video generation | ✅ Complete |
| **Phase 5** | Advanced memory & conversation management | ✅ Complete |
| **Phase 6** | Soundtrack generation & audio orchestration | ✅ Complete |
| **Phase 7** | Production deployment & security hardening | ✅ Complete |

---

## 🔧 TECHNICAL STACK

### Backend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Python** | Core backend language | 3.11+ |
| **FastAPI** | Web framework & REST API | Latest |
| **SQLAlchemy** | ORM for database | 2.0+ |
| **PostgreSQL** | Primary database | 14+ |
| **Pydantic** | Data validation | Latest |
| **Python-dotenv** | Environment configuration | Latest |

### Backend AI/ML Libraries

| Library | Purpose |
|---------|---------|
| **LangChain** | LLM orchestration and chains |
| **OpenAI/Ollama** | Large language models |
| **Pipecat** | Conversational AI framework |
| **ElevenLabs SDK** | TTS/Voice cloning |
| **Replicate API** | Image/video generation |
| **Librosa** | Audio processing |
| **MediaPy** | Video generation |

### Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Next.js** | React framework | 14+ |
| **React** | UI library | Latest |
| **TypeScript** | Type-safe JavaScript | Latest |
| **Tailwind CSS** | Styling framework | Latest |
| **Socket.io** | Real-time communication | Latest |

### Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD pipelines |
| **Bash Scripts** | Deployment automation |

---

## 🏗️ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js React Frontend (Port 3000)                       │   │
│  │  - Chat Component                                         │   │
│  │  - Voice Input/Output UI                                 │   │
│  │  - Avatar Display                                        │   │
│  │  - Settings & Configuration                             │   │
│  │  - Media Gallery                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    WebSocket + REST API
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FastAPI Server (Port 8000)                              │   │
│  │  - HTTP/WebSocket endpoints                             │   │
│  │  - Request validation & routing                         │   │
│  │  - CORS & security middleware                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ LLM Service          │ Avatar Service                     │   │
│  │ STT Service          │ Video Generation Service           │   │
│  │ TTS Service          │ Image Generation Service           │   │
│  │ Voice Clone Service  │ Soundtrack Generation Service      │   │
│  │ Audio Enhancement    │ Media Orchestrator                 │   │
│  │ Pipecat Orchestrator │ Conversation Memory                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                     │   │
│  │  - Conversations & Messages                             │   │
│  │  - User Settings & Preferences                          │   │
│  │  - Generated Media Metadata                             │   │
│  │  - AI Model Configurations                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ OpenAI API / Ollama (LLM)      | Replicate (Gen AI)      │   │
│  │ ElevenLabs (TTS/Voice)         | Google Cloud STT        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 PROJECT STRUCTURE

```
Personal Assistant/
│
├── 📄 Documentation (Root Level)
│   ├── README.md                          # Project overview
│   ├── QUICK_START.md                     # 5-minute setup
│   ├── GETTING_STARTED_GUIDE.md           # Detailed setup
│   ├── USER_GUIDE.md                      # Feature documentation
│   ├── TRAINING_GUIDE.md                  # AI customization
│   ├── TESTING_GUIDE.md                   # Testing procedures
│   ├── QUICK_REFERENCE.md                 # Command reference
│   ├── PRODUCTION_SECURITY.md             # Security guide
│   └── PHASE_7_COMPLETION.md              # Deployment guide
│
├── 🐍 backend/                            # FastAPI Backend
│   ├── main.py                            # Entry point & FastAPI app
│   ├── config.py                          # Configuration management
│   ├── requirements.txt                   # Python dependencies
│   ├── README.md                          # Backend documentation
│   │
│   ├── db/                                # Database Layer
│   │   ├── __init__.py
│   │   ├── database.py                    # Database connection
│   │   └── models.py                      # SQLAlchemy models
│   │
│   ├── memory/                            # Conversation Memory
│   │   ├── __init__.py
│   │   └── conversation_memory.py         # Memory management
│   │
│   ├── services/                          # AI Services (13 total)
│   │   ├── __init__.py
│   │   ├── llm_service.py                 # LLM orchestration
│   │   ├── stt_service.py                 # Speech-to-Text
│   │   ├── tts_service.py                 # Text-to-Speech
│   │   ├── voice_clone_service.py         # Voice cloning
│   │   ├── avatar_service.py              # Avatar rendering
│   │   ├── avatar_lipsync_service.py      # Lip-sync animation
│   │   ├── image_generation_service.py    # Image AI generation
│   │   ├── video_generation_service.py    # Video generation
│   │   ├── soundtrack_generation_service.py # Music generation
│   │   ├── audio_enhancement_service.py   # Audio processing
│   │   ├── media_orchestrator.py          # Media coordination
│   │   ├── pipecat_orchestrator.py        # Pipecat framework
│   │   └── __pycache__/                   # Python cache (ignored)
│   │
│   └── migrations/                        # Alembic migrations
│
├── ⚛️ frontend/                           # Next.js Frontend
│   ├── package.json                       # Dependencies & scripts
│   ├── next.config.js                     # Next.js configuration
│   ├── tailwind.config.ts                 # Tailwind config
│   ├── tsconfig.json                      # TypeScript config
│   ├── postcss.config.js                  # PostCSS config
│   ├── README.md                          # Frontend documentation
│   │
│   ├── public/                            # Static assets
│   │   ├── avatar-models/                 # 3D avatar models
│   │   ├── backgrounds/                   # UI backgrounds
│   │   └── icons/                         # UI icons
│   │
│   └── src/                               # Source code
│       ├── app/                           # Next.js app directory
│       │   ├── layout.tsx                 # Root layout
│       │   ├── page.tsx                   # Home page
│       │   ├── chat/page.tsx              # Chat page
│       │   ├── settings/page.tsx          # Settings page
│       │   └── media/page.tsx             # Media gallery page
│       │
│       ├── components/                    # React components
│       │   ├── ChatBox.tsx                # Chat interface
│       │   ├── VoiceInput.tsx             # Voice capture
│       │   ├── AvatarDisplay.tsx          # Avatar renderer
│       │   ├── MediaGallery.tsx           # Media display
│       │   ├── Settings.tsx               # Settings form
│       │   └── ...                        # Other components
│       │
│       ├── hooks/                        # Custom React hooks
│       │   ├── useChat.ts                # Chat logic hook
│       │   ├── useAudio.ts               # Audio handling
│       │   └── useWebSocket.ts           # WebSocket connection
│       │
│       └── services/                     # Frontend services
│           ├── api.ts                    # API client
│           ├── websocket.ts              # WebSocket client
│           └── storage.ts                # Local storage helpers
│
├── 📜 scripts/                            # Deployment & Automation
│   ├── setup.sh                           # Initial setup script
│   ├── start-dev.sh                       # Start development
│   ├── install-ollama.sh                  # Install Ollama LLM
│   ├── deploy-local.sh                    # Local deployment
│   ├── deploy-production.sh               # Production deployment
│   └── health-check.sh                    # Health monitoring
│
├── 📚 docs/                               # Technical Documentation
│   ├── API.md                             # API reference
│   ├── ARCHITECTURE.md                    # Architecture details
│   └── TROUBLESHOOTING.md                 # Common issues
│
├── 🐳 Docker Configuration
│   ├── docker compose.yml                 # Development environment
│   ├── docker compose.prod.yml            # Production environment
│   ├── Dockerfile.backend                 # Backend container
│   └── Dockerfile.frontend                # Frontend container
│
├── 🔄 .github/
│   └── workflows/
│       └── ci-cd.yml                      # GitHub Actions pipeline
│
├── 📊 Other Directories
│   ├── data/                              # Data files & exports
│   ├── models/                            # ML models & weights
│   ├── migrations/                        # Database migrations
│   └── public/                            # Shared static files
│
└── 📄 Root Configuration Files
    ├── .env.production                    # Production environment
    ├── .gitignore                         # Git ignore rules
    └── .dockerignore                      # Docker ignore rules
```

---

## 🐍 BACKEND SYSTEM

### Backend Architecture

**Framework**: FastAPI (async web framework)  
**Entry Point**: `backend/main.py`  
**Port**: 8000 (development), 8000 (production with Docker)

### Main FastAPI Application

```python
# backend/main.py structure:
- FastAPI app initialization
- CORS middleware configuration
- WebSocket endpoint setup
- REST API route registration
- Background task scheduling
- Startup/shutdown events
```

### Key Endpoints

#### Chat Endpoints

- `POST /api/chat/message` - Send text message
- `WebSocket /api/chat/stream` - Real-time chat stream
- `GET /api/chat/history` - Get conversation history
- `DELETE /api/chat/history/{id}` - Clear conversation

#### Voice Endpoints

- `POST /api/voice/transcribe` - STT (speech to text)
- `POST /api/voice/synthesize` - TTS (text to speech)
- `POST /api/voice/clone` - Voice cloning

#### Avatar Endpoints

- `POST /api/avatar/render` - Render avatar
- `POST /api/avatar/lipsync` - Generate lip-sync animation

#### Media Generation

- `POST /api/media/image/generate` - Generate image via AI
- `POST /api/media/video/generate` - Generate video
- `POST /api/media/soundtrack/generate` - Generate music

#### Settings Endpoints

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

### Database Layer (`backend/db/`)

**Database**: PostgreSQL 14+

#### Database Models (SQLAlchemy)

```python
# Key models in backend/db/models.py:

User
├── id (UUID, primary key)
├── username (String, unique)
├── email (String, unique)
└── created_at (DateTime)

Conversation
├── id (UUID, primary key)
├── user_id (Foreign key → User)
├── title (String)
├── created_at (DateTime)
└── updated_at (DateTime)

Message
├── id (UUID, primary key)
├── conversation_id (Foreign key → Conversation)
├── sender (String: 'user' or 'assistant')
├── content (Text)
├── role (String: 'text', 'voice', 'image', 'video')
├── metadata (JSON)
└── created_at (DateTime)

GeneratedMedia
├── id (UUID, primary key)
├── user_id (Foreign key → User)
├── type (String: 'image', 'video', 'avatar_animation', 'soundtrack')
├── prompt (Text)
├── file_path (String)
├── metadata (JSON)
└── created_at (DateTime)

UserSettings
├── id (UUID, primary key)
├── user_id (Foreign key → User)
├── llm_model (String)
├── voice_preference (String)
├── avatar_style (String)
├── theme (String)
└── preferences (JSON)
```

### Memory System (`backend/memory/`)

**Purpose**: Manages conversation context and memory

```python
# backend/memory/conversation_memory.py

ConversationMemory class:
├── Methods:
│   ├── add_message()          # Add message to memory
│   ├── get_context()          # Get relevant context
│   ├── clear_memory()         # Clear conversation memory
│   ├── get_conversation_summary()
│   └── get_relevant_history() # Semantic search on history
└── Features:
    ├── Persistent storage in PostgreSQL
    ├── Context window management
    ├── Semantic similarity search
    └── Conversation summarization
```

---

## ⚛️ FRONTEND SYSTEM

### Frontend Architecture

**Framework**: Next.js 14 with React 18  
**Language**: TypeScript  
**Port**: 3000  
**Styling**: Tailwind CSS

### Page Structure (`frontend/src/app/`)

#### 1. Home Page (`page.tsx`)

- Project introduction
- Quick start options
- Feature overview
- Navigation to main features

#### 2. Chat Page (`chat/page.tsx`)

- Main chat interface
- Real-time message display
- Chat input area
- Conversation history sidebar

#### 3. Settings Page (`settings/page.tsx`)

- AI model configuration
- Voice preferences
- Avatar customization
- Application theme
- Advanced settings

#### 4. Media Gallery Page (`media/page.tsx`)

- Display generated images
- Display generated videos
- Display created avatars
- Media management (download, delete)

### Core Components (`frontend/src/components/`)

#### ChatBox Component

```typescript
// Handles:
- Message display and history
- User input (text)
- Real-time updates via WebSocket
- Message formatting and rendering
```

#### VoiceInput Component

```typescript
// Handles:
- Audio recording
- Voice input capture
- Real-time transcription
- Visual feedback
```

#### AvatarDisplay Component

```typescript
// Handles:
- 3D avatar rendering
- Animation playback
- Lip-sync animation
- Avatar customization
```

#### MediaGallery Component

```typescript
// Handles:
- Display generated media
- Gallery layout
- Media preview
- Download/delete actions
```

#### Settings Component

```typescript
// Handles:
- User preference forms
- Model selection
- Voice preference picker
- Theme switcher
- Settings persistence
```

### Custom Hooks (`frontend/src/hooks/`)

#### useChat Hook

```typescript
// Provides:
- Chat state management
- Send message function
- Conversation history
- Message formatting
```

#### useAudio Hook

```typescript
// Provides:
- Audio recording control
- Playback functionality
- Audio level visualization
- Permission handling
```

#### useWebSocket Hook

```typescript
// Provides:
- WebSocket connection management
- Real-time message handling
- Connection status
- Automatic reconnection
```

### API Services (`frontend/src/services/`)

#### api.ts - REST API Client

```typescript
// Provides methods for:
- POST /api/chat/message
- GET /api/chat/history
- POST /api/media/image/generate
- PUT /api/settings
- All REST endpoints with error handling
```

#### websocket.ts - WebSocket Client

```typescript
// Provides:
- WebSocket connection
- Event handlers
- Automatic reconnection
- Message queueing
```

#### storage.ts - Local Storage Helpers

```typescript
// Provides:
- Save user preferences locally
- Cache conversation data
- Manage local settings
- Offline capability
```

---

## 🗄️ DATABASE SCHEMA

### PostgreSQL Tables

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### conversations

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

#### messages

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    role VARCHAR(50), -- 'text', 'voice', 'image', 'video'
    metadata JSONB, -- Additional context
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### generated_media

```sql
CREATE TABLE generated_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50), -- 'image', 'video', 'avatar_animation', 'soundtrack'
    prompt TEXT,
    file_path VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_generated_media_user_id ON generated_media(user_id);
CREATE INDEX idx_generated_media_type ON generated_media(type);
```

#### user_settings

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    llm_model VARCHAR(255),
    voice_preference VARCHAR(255),
    avatar_style VARCHAR(255),
    theme VARCHAR(50),
    preferences JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API ENDPOINTS

### Complete API Reference

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Chat

- `POST /api/chat/message` - Send message
- `WebSocket /api/chat/stream` - Real-time stream
- `GET /api/chat/history` - Conversation history
- `GET /api/chat/conversations` - List conversations
- `DELETE /api/chat/history/{id}` - Delete message

#### Voice

- `POST /api/voice/transcribe` - Speech to text

  ```json
  {
    "audio": "base64_encoded_audio",
    "language": "en"
  }
  ```

- `POST /api/voice/synthesize` - Text to speech

  ```json
  {
    "text": "Hello world",
    "voice": "voice_id",
    "speed": 1.0
  }
  ```

- `POST /api/voice/clone` - Clone voice

  ```json
  {
    "name": "voice_name",
    "audio_sample": "base64_audio"
  }
  ```

#### Avatar

- `POST /api/avatar/render` - Render avatar

  ```json
  {
    "style": "3d",
    "expression": "neutral",
    "animation": "talking"
  }
  ```

- `POST /api/avatar/lipsync` - Generate lip-sync

  ```json
  {
    "audio_file": "path/to/audio.mp3",
    "character_id": "avatar_1"
  }
  ```

#### Media Generation

- `POST /api/media/image/generate` - Generate image

  ```json
  {
    "prompt": "A beautiful sunset",
    "style": "photorealistic",
    "size": "1024x1024"
  }
  ```

- `POST /api/media/video/generate` - Generate video

  ```json
  {
    "prompt": "A dancing robot",
    "duration": 10,
    "fps": 30
  }
  ```

- `POST /api/media/soundtrack/generate` - Generate music

  ```json
  {
    "mood": "uplifting",
    "duration": 60,
    "genre": "electronic"
  }
  ```

- `GET /api/media/gallery` - Get media gallery
- `GET /api/media/{id}` - Get media details
- `DELETE /api/media/{id}` - Delete media

#### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

  ```json
  {
    "llm_model": "gpt-4",
    "voice_preference": "luna",
    "avatar_style": "3d",
    "theme": "dark"
  }
  ```

#### Health & Status

- `GET /api/health` - Health check
- `GET /api/status` - System status

---

## 🧠 AI SERVICES

### Service Architecture

All AI services located in `backend/services/` and expose standardized interfaces.

### 1. LLM Service (`llm_service.py`)

**Purpose**: LLM orchestration and conversational intelligence

```python
class LLMService:
    # Methods
    def generate_response(prompt: str, context: str) → str
    def stream_response(prompt: str) → Iterator[str]
    def generate_with_tools(prompt: str, tools: List) → Dict
    def set_model(model_name: str) → None
    def get_available_models() → List[str]
    
    # Supports
    - OpenAI GPT-4/3.5
    - Ollama (local models)
    - Context awareness
    - Function calling
```

**Configuration**:

```python
# In backend/config.py
LLM_PROVIDER = "openai"  # or "ollama"
LLM_MODEL = "gpt-4"
LLM_TEMPERATURE = 0.7
LLM_MAX_TOKENS = 2000
```

### 2. STT Service (`stt_service.py`)

**Purpose**: Speech-to-Text (audio to text)

```python
class STTService:
    # Methods
    def transcribe(audio_path: str, language: str) → str
    def transcribe_stream(audio_stream: BytesIO) → str
    def get_available_languages() → List[str]
    
    # Supports
    - Google Cloud Speech-to-Text
    - OpenAI Whisper
    - Real-time streaming
    - Multiple languages
```

### 3. TTS Service (`tts_service.py`)

**Purpose**: Text-to-Speech (text to audio)

```python
class TTSService:
    # Methods
    def synthesize(text: str, voice_id: str, speed: float) → AudioFile
    def synthesize_stream(text: str) → AudioStream
    def get_available_voices() → List[Voice]
    def set_voice(voice_id: str) → None
    
    # Supports
    - ElevenLabs (natural voices)
    - Google TTS
    - Voice customization
    - Speed control
```

### 4. Voice Clone Service (`voice_clone_service.py`)

**Purpose**: Clone and customize voices

```python
class VoiceCloneService:
    # Methods
    def clone_voice(name: str, audio_samples: List[AudioFile]) → str
    def list_cloned_voices() → List[str]
    def delete_voice(voice_id: str) → bool
    def synthesize_with_clone(text: str, voice_id: str) → AudioFile
    
    # Supports
    - Voice sample training
    - Custom voice generation
    - Voice parameter tuning
```

### 5. Avatar Service (`avatar_service.py`)

**Purpose**: 3D avatar rendering and management

```python
class AvatarService:
    # Methods
    def render_avatar(style: str, expression: str, props: Dict) → Image
    def get_available_styles() → List[str]
    def get_expressions() → List[str]
    def customize_avatar(avatar_id: str, config: Dict) → str
    
    # Supports
    - Multiple avatar styles (3D, 2D, anime)
    - Expressions (neutral, happy, sad, surprised, etc.)
    - Custom appearance settings
    - Animation presets
```

### 6. Avatar LipSync Service (`avatar_lipsync_service.py`)

**Purpose**: Generate synchronized lip-sync animations

```python
class AvatarLipsyncService:
    # Methods
    def generate_lipsync(audio_file: str, character_id: str) → VideoFile
    def analyze_audio_phonemes(audio_file: str) → List[Phoneme]
    def generate_mouth_shapes(phonemes: List[Phoneme]) → List[Image]
    
    # Supports
    - Phoneme-based lip-sync
    - Real audio analysis
    - Multiple character types
    - Animation smoothing
```

### 7. Image Generation Service (`image_generation_service.py`)

**Purpose**: AI-powered image generation

```python
class ImageGenerationService:
    # Methods
    def generate_image(prompt: str, style: str, size: str) → Image
    def generate_variations(image_path: str, count: int) → List[Image]
    def edit_image(image_path: str, prompt: str) → Image
    def upscale_image(image_path: str, scale: float) → Image
    
    # Supports
    - Replicate API (Stable Diffusion, DALL-E)
    - Multiple styles
    - Size options
    - Upscaling
```

### 8. Video Generation Service (`video_generation_service.py`)

**Purpose**: AI-powered video generation

```python
class VideoGenerationService:
    # Methods
    def generate_video(prompt: str, duration: int, fps: int) → VideoFile
    def combine_avatar_with_audio(avatar_frames: List[Image], audio_file: str) → VideoFile
    def add_effects(video_path: str, effects: List[str]) → VideoFile
    
    # Supports
    - Text to video generation
    - Avatar animation rendering
    - Audio-video synchronization
    - Effects and transitions
```

### 9. Soundtrack Generation Service (`soundtrack_generation_service.py`)

**Purpose**: Generate background music and soundtracks

```python
class SoundtrackGenerationService:
    # Methods
    def generate_soundtrack(mood: str, duration: int, genre: str) → AudioFile
    def generate_ambient_music(style: str, duration: int) → AudioFile
    def generate_effects_mix(effects: List[str]) → AudioFile
    
    # Supports
    - Mood-based generation
    - Multiple genres
    - Duration customization
    - Effects layering
```

### 10. Audio Enhancement Service (`audio_enhancement_service.py`)

**Purpose**: Real-time audio processing and enhancement

```python
class AudioEnhancementService:
    # Methods
    def enhance_audio(audio_path: str, enhancement_type: str) → AudioFile
    def remove_background_noise(audio_path: str) → AudioFile
    def normalize_volume(audio_path: str) → AudioFile
    def apply_effects(audio_path: str, effects: List[str]) → AudioFile
    
    # Supports
    - Noise reduction
    - Volume normalization
    - Audio effects
    - Real-time processing
```

### 11. Media Orchestrator (`media_orchestrator.py`)

**Purpose**: Coordinate multiple media services

```python
class MediaOrchestrator:
    # Methods
    def generate_complete_response(text: str, config: Dict) → CompleteMedia
    def orchestrate_avatar_animation(text: str, style: str) → VideoFile
    def generate_multimedia_content(prompt: str, types: List[str]) → Dict
    
    # Coordinated Operations
    - TTS → Audio
    - Audio → LipSync animation
    - Avatar rendering
    - Final video composition
```

### 12. Pipecat Orchestrator (`pipecat_orchestrator.py`)

**Purpose**: Integrate Pipecat conversational AI framework

```python
class PipecatOrchestrator:
    # Methods
    def initialize_pipeline() → Pipeline
    def add_service(service_type: str, config: Dict) → None
    def run_conversation(user_input: str) → str
    def manage_context_window() → None
    
    # Features
    - Multi-turn conversations
    - Service chaining
    - Real-time processing
    - Context management
```

### 13. Conversation Memory (`memory/conversation_memory.py`)

**Purpose**: Manage conversation context and history

```python
class ConversationMemory:
    # Methods
    def add_message(role: str, content: str, metadata: Dict) → None
    def get_context(num_messages: int = 10) → str
    def clear_memory() → None
    def get_conversation_summary() → str
    def get_relevant_history(query: str) → List[Message]
    
    # Features
    - Context window management
    - Semantic search
    - Message summarization
    - Persistent storage
```

---

## ⚙️ CONFIGURATION & ENVIRONMENT

### Environment Variables

**Backend Configuration** (`backend/config.py`):

```python
# Database
DATABASE_URL = "postgresql://user:password@localhost:5432/personal_ai"

# API Keys
OPENAI_API_KEY = "sk-..."
ELEVENLABS_API_KEY = "sk-..."
REPLICATE_API_KEY = "..."
GOOGLE_CLOUD_API_KEY = "..."

# LLM Configuration
LLM_PROVIDER = "openai"              # or "ollama"
LLM_MODEL = "gpt-4"
LLM_TEMPERATURE = 0.7
LLM_MAX_TOKENS = 2000
LLM_CONTEXT_WINDOW = 10              # Number of previous messages

# TTS Configuration
TTS_PROVIDER = "elevenlabs"
TTS_VOICE_ID = "voice_id"
TTS_SPEED = 1.0

# Avatar Configuration
AVATAR_STYLE = "3d"                  # or "2d", "anime"
AVATAR_DEFAULT_EXPRESSION = "neutral"

# Server Configuration
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000
ENVIRONMENT = "development"          # or "production"

# CORS Configuration
CORS_ORIGINS = ["http://localhost:3000", "https://yourdomain.com"]
```

### Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd "Personal Assistant"

# 2. Run setup script
bash scripts/setup.sh

# 3. Activate virtual environment
source .venv/bin/activate

# 4. Create .env file
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# 5. Install dependencies
pip install -r backend/requirements.txt
cd frontend && npm install

# 6. Start development environment
bash scripts/start-dev.sh
```

### Production Setup

```bash
# Build and run with Docker
docker compose -f docker compose.prod.yml up -d

# Monitor services
bash scripts/health-check.sh

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Setting Up Development Environment

#### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Docker & Docker Compose (optional but recommended)
- Git

#### Step-by-Step Setup

```bash
# 1. Navigate to project directory
cd "/home/nsoumyaprakash/Desktop/Personal/Projects/Personal Assistant"

# 2. Run setup script (installs dependencies)
bash scripts/setup.sh

# 3. Activate Python virtual environment
source .venv/bin/activate

# 4. Configure environment variables
# Create backend/.env with:
DATABASE_URL="postgresql://local_user:local_pass@localhost/personal_ai"
OPENAI_API_KEY="your-key-here"
ENVIRONMENT="development"

# 5. Initialize database
cd backend
python -m alembic upgrade head
cd ..

# 6. Start development server
bash scripts/start-dev.sh
```

#### What start-dev.sh Does

```bash
#!/bin/bash
# Starts:
# - PostgreSQL (if using Docker)
# - Backend FastAPI server (port 8000)
# - Frontend Next.js dev server (port 3000)
# - Watches for code changes (hot reload)
```

### Common Development Tasks

#### 1. Adding a New Service

**File**: `backend/services/my_new_service.py`

```python
from typing import Optional
from pydantic import BaseModel

class MyServiceConfig(BaseModel):
    setting_1: str
    setting_2: int

class MyNewService:
    def __init__(self, config: MyServiceConfig):
        self.config = config
    
    async def process(self, input_data: str) -> str:
        """Main service method"""
        # Implementation
        return result
    
    async def initialize(self) -> None:
        """Called on startup"""
        pass
    
    async def cleanup(self) -> None:
        """Called on shutdown"""
        pass
```

Then register in `backend/main.py`:

```python
from services.my_new_service import MyNewService

my_service = MyNewService(config)

@app.post("/api/my-endpoint")
async def my_endpoint(data: InputModel):
    return await my_service.process(data)
```

#### 2. Adding a New Frontend Page

**File**: `frontend/src/app/newpage/page.tsx`

```typescript
'use client';

import React from 'react';
import { useChat } from '@/hooks/useChat';

export default function NewPage() {
  const { messages, sendMessage } = useChat();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">New Page</h1>
      {/* Your content */}
    </div>
  );
}
```

Add route in navigation component.

#### 3. Adding a Database Model

**File**: `backend/db/models.py`

```python
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class NewModel(Base):
    __tablename__ = "new_model"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

Create migration:

```bash
cd backend
alembic revision --autogenerate -m "Add NewModel table"
alembic upgrade head
```

#### 4. Making an API Call from Frontend

**File**: `frontend/src/services/api.ts`

```typescript
export async function myApiCall(data: any) {
  const response = await fetch('/api/my-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
```

Use in component:

```typescript
const handleClick = async () => {
  const result = await myApiCall({ key: 'value' });
  console.log(result);
};
```

#### 5. Running Tests

**Backend**: `backend/test-*.py`

```bash
# Run all tests
bash scripts/test.sh

# Run specific test
python backend/test-phase5.py

# Run with pytest
pytest backend/ -v
```

**Frontend**: `frontend/__tests__`

```bash
# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 🐳 DEPLOYMENT INFRASTRUCTURE

### Docker Setup

#### Development Docker Compose

**File**: `docker compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_pass
      POSTGRES_DB: personal_ai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://dev_user:dev_pass@postgres:5432/personal_ai
      ENVIRONMENT: development
    depends_on:
      - postgres
    volumes:
      - ./backend:/app/backend

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Production Docker Compose

**File**: `docker compose.prod.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: personal_ai_prod
    volumes:
      - postgres_prod:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: personal-ai-backend:latest
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      ENVIRONMENT: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: personal-ai-frontend:latest
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_prod:
```

### Deployment Scripts

#### Local Deployment (`scripts/deploy-local.sh`)

```bash
#!/bin/bash
# Deploys to local Docker environment
docker compose build
docker compose up -d
echo "✓ Local deployment complete"
```

#### Production Deployment (`scripts/deploy-production.sh`)

```bash
#!/bin/bash
# Deploys to production with backup
docker compose -f docker compose.prod.yml down
docker volume create personal_ai_backup
docker compose -f docker compose.prod.yml up -d
bash scripts/health-check.sh
echo "✓ Production deployment complete"
```

### CI/CD Pipeline

**File**: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          cd frontend && npm install
      
      - name: Run backend tests
        run: pytest backend/
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Build Docker images
        run: |
          docker build -f Dockerfile.backend -t personal-ai-backend:latest .
          docker build -f Dockerfile.frontend -t personal-ai-frontend:latest ./frontend

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to production
        run: bash scripts/deploy-production.sh
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## 📋 COMMON DEVELOPMENT TASKS

### Task: Update LLM Model

```python
# File: backend/services/llm_service.py

# Change model
LLM_MODEL = "gpt-4-turbo"  # or use Ollama local model

# Or set via API
# In frontend:
const handleModelChange = async (newModel: string) => {
  await fetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ llm_model: newModel })
  });
};
```

### Task: Add New Avatar Style

```python
# File: backend/services/avatar_service.py

AVATAR_STYLES = {
    "3d": {"model": "avatar_3d.obj", "config": {...}},
    "2d": {"model": "avatar_2d.png", "config": {...}},
    "anime": {"model": "anime.obj", "config": {...}},
    "realistic": {"model": "realistic.obj", "config": {...}}  # NEW
}

# Update frontend selector to include "realistic"
```

### Task: Add New Voice

```python
# File: backend/services/tts_service.py

AVAILABLE_VOICES = {
    "luna": "voice_id_1",
    "david": "voice_id_2",
    "sarah": "voice_id_3",
    "nova": "voice_id_4"  # NEW
}
```

### Task: Modify Message Storage

```python
# File: backend/db/models.py
# Add new field to Message model

class Message(Base):
    # ... existing fields ...
    emotion: Column(String)  # NEW - store detected emotion
    confidence: Column(Float)  # NEW - confidence score
```

### Task: Create New API Endpoint

```python
# File: backend/main.py

@app.post("/api/custom/new-endpoint")
async def new_endpoint(data: InputModel) -> OutputModel:
    """
    Docstring explaining the endpoint
    
    Args:
        data: Input data
    
    Returns:
        Output data
    """
    result = await some_service.process(data)
    return OutputModel(result=result)
```

### Task: Deploy New Version

```bash
# 1. Make and test changes locally
npm run dev  # Frontend
# In another terminal: uvicorn backend.main:app --reload

# 2. Commit changes
git add .
git commit -m "Feature: Add new capability"
git push origin feature-branch

# 3. Create pull request (triggers CI/CD tests)

# 4. Merge to main branch

# 5. GitHub Actions automatically deploys to production

# 6. Verify deployment
bash scripts/health-check.sh
```

---

## 🧪 TESTING STRATEGY

### Backend Testing

**Test Location**: `backend/test-phase*.py`

```python
# Example test structure
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_chat_endpoint():
    response = client.post("/api/chat/message", json={"text": "Hello"})
    assert response.status_code == 200
    assert "response" in response.json()

def test_llm_service():
    from backend.services.llm_service import LLMService
    service = LLMService()
    result = service.generate_response("test prompt")
    assert result is not None
```

### Frontend Testing

**Test Location**: `frontend/__tests__/`

```typescript
// Example test structure
import { render, screen } from '@testing-library/react';
import ChatBox from '@/components/ChatBox';

describe('ChatBox', () => {
  it('renders chat component', () => {
    render(<ChatBox />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Backend tests
python -m pytest backend/ -v

# Frontend tests
npm test

# Integration tests
bash scripts/test.sh

# Coverage report
npm test -- --coverage
```

---

## 🔧 TROUBLESHOOTING

### Common Issues & Solutions

#### Issue: Database Connection Error

```
Error: Could not connect to PostgreSQL
```

**Solution**:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or with Docker
docker ps | grep postgres

# Verify DATABASE_URL is correct in .env
# Format: postgresql://user:password@host:port/dbname
```

#### Issue: API Port Already in Use

```
Error: Port 8000 already in use
```

**Solution**:

```bash
# Kill process using port
lsof -i :8000
kill -9 <PID>

# Or use different port in .env
SERVER_PORT=8001
```

#### Issue: Frontend can't connect to Backend

```
Error: Failed to fetch from http://localhost:8000
```

**Solution**:

```bash
# Check CORS configuration in backend/main.py
# Add frontend URL to CORS_ORIGINS
# Verify backend is running: curl http://localhost:8000/api/health
```

#### Issue: Out of Memory during Video Generation

```
Error: MemoryError during video generation
```

**Solution**:

```python
# Reduce video resolution or duration in config
VIDEO_GENERATION_MAX_DURATION = 30  # seconds
VIDEO_GENERATION_MAX_SIZE = "720p"  # or "480p"
```

#### Issue: OpenAI API Rate Limit

```
Error: Rate limit exceeded for OpenAI API
```

**Solution**:

```python
# Implement rate limiting and caching
# In backend/services/llm_service.py
from functools import lru_cache
from time import time

@lru_cache(maxsize=100)
def get_cached_response(prompt: str) -> str:
    # Caches responses for 1 hour
    pass
```

#### Issue: WebSocket Connection Issues

```
Error: WebSocket reconnection failed
```

**Solution**:

```typescript
// In frontend/src/services/websocket.ts
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

// Implements automatic reconnection with exponential backoff
```

---

## 🗺️ FUTURE ROADMAP

### Phase 8: Mobile App (Planned)

- React Native mobile application
- Offline capability
- Background conversation processing
- Push notifications

### Phase 9: Multi-Language Support (Planned)

- Support for 20+ languages
- Automatic language detection
- Localized UI
- Region-specific models

### Phase 10: Advanced Analytics (Planned)

- Conversation analytics dashboard
- Usage patterns
- AI model performance metrics
- User engagement tracking

### Phase 11: Enterprise Features (Planned)

- Multi-user workspace
- Role-based access control (RBAC)
- Advanced security & compliance
- Team collaboration features

### Phase 12: Plugin System (Planned)

- Plugin architecture for extending functionality
- Custom service integration
- Community plugin marketplace
- API for third-party developers

---

## 📚 Additional Resources

### Documentation Files

- **[QUICK_START.md](QUICK_START.md)** - 5-minute quick start
- **[GETTING_STARTED_GUIDE.md](GETTING_STARTED_GUIDE.md)** - Detailed setup
- **[USER_GUIDE.md](USER_GUIDE.md)** - Feature documentation
- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)** - AI customization
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing procedures
- **[PRODUCTION_SECURITY.md](PRODUCTION_SECURITY.md)** - Security hardening
- **[docs/API.md](docs/API.md)** - Complete API reference
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture details
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues

### External Resources

- **FastAPI**: <https://fastapi.tiangolo.com/>
- **Next.js**: <https://nextjs.org/docs>
- **SQLAlchemy**: <https://docs.sqlalchemy.org/>
- **Pydantic**: <https://docs.pydantic.dev/>
- **React**: <https://react.dev/>

---

## 🎓 Quick Reference for AI Agents

### When Starting Work on This Project

1. **Read This Document First** - Understand the architecture and components
2. **Check Project Structure** - Familiarize with file organization
3. **Review API Design** - Know what endpoints exist and how they work
4. **Understand Services** - Each service has a specific responsibility
5. **Check Configuration** - Understand environment variables and settings
6. **Review Recent Changes** - Check git history for context
7. **Run Tests** - Verify everything is working
8. **Ask Questions** - If something is unclear, check docs or code comments

### Key Principles

- **Modularity**: Each service is self-contained and reusable
- **Async-First**: Use async/await for I/O operations
- **Error Handling**: Always handle exceptions gracefully
- **Documentation**: Comment complex logic and update docs
- **Testing**: Write tests for new features
- **Security**: Never commit API keys, use environment variables
- **Performance**: Consider caching and optimization
- **Scalability**: Design services to handle scale

---

## 📞 Support & Contribution

### For Issues or Questions

1. Check this document first
2. Review related documentation files
3. Check code comments and docstrings
4. Look at existing similar implementations
5. Test locally before deploying

### Making Changes

1. Create a feature branch
2. Make changes incrementally
3. Test thoroughly
4. Update documentation
5. Commit with clear messages
6. Create pull request
7. Address review comments
8. Merge and deploy

---

**Document Version**: 1.0  
**Last Updated**: March 23, 2026  
**Project Status**: Production Ready  
**Document Purpose**: Complete AI Agent Handoff Guide  

---

> This document is the comprehensive guide for any AI agent working on the Personal AI Assistant project. It contains everything needed to understand the codebase, deploy changes, and contribute effectively. Keep this document updated as the project evolves.
