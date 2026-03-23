# Astra — AI Agent Reference

Complete technical reference for any AI agent working on the Astra project.

---

## Project Summary

**Astra** is a local AI assistant with chat, voice, image/video/music generation, avatar animation, and LoRA training. Personal single-user project — no auth, no Docker, no cloud. Version 2.0.0.

---

## Architecture

```
Browser (localhost:3000)
  ↓ HTTP / WebSocket
Next.js 15 Frontend (React 19, Tailwind CSS 4, Zustand 5)
  ↓ fetch() to localhost:8000
FastAPI Backend (Python, async)
  ├── LLM → Ollama (localhost:11434, default: mistral)
  ├── STT → Whisper
  ├── TTS → piper-tts / basic
  ├── Image Gen → Stable Diffusion (diffusers)
  ├── Video Gen → ZeroScope / ModelScope / SVD
  ├── Music Gen → MusicGen (transformers)
  ├── Avatar → OpenCV + Pillow
  ├── Training → LoRA (PEFT)
  ├── Memory → In-memory conversation store (memory.py)
  └── Database → SQLite (astra.db) via SQLAlchemy 2.0
```

---

## File Map

```
Astra/
├── .env                    # Configuration (Ollama URL, model, LLM params)
├── .gitignore
├── setup.sh                # Install backend venv + frontend npm + Ollama model
├── run.sh                  # Start backend + frontend together
├── README.md               # Project overview
├── GUIDE.md                # User guide (all features explained)
├── AGENT.md                # This file (technical reference)
├── LICENSE                 # MIT
│
├── backend/
│   ├── main.py             # FastAPI app — ALL routes (24+ endpoints across 10 route groups)
│   ├── config.py           # Pydantic settings from .env (Settings class)
│   ├── llm.py              # Ollama LLM integration (async chat + health check)
│   ├── memory.py           # In-memory conversation history (dict-based)
│   ├── database.py         # SQLAlchemy engine, session, init_db()
│   ├── models.py           # ORM models: Conversation, GeneratedMedia
│   ├── requirements.txt    # Python deps (FastAPI, SQLAlchemy, pydantic-settings, ML libs)
│   ├── astra.db            # SQLite database (auto-created)
│   ├── storage/            # Generated files (auto-created subdirs)
│   │   ├── images/
│   │   ├── videos/
│   │   ├── audio/
│   │   ├── avatars/
│   │   ├── training/
│   │   └── voice/
│   └── services/
│       ├── __init__.py     # Lazy exports
│       ├── stt.py          # Speech-to-text (Whisper)
│       ├── tts.py          # Text-to-speech (piper/basic fallback)
│       ├── voice.py        # Voice pipeline (STT → LLM → TTS)
│       ├── image.py        # Image gen: text2img, img2img, LoRA inference
│       ├── video.py        # Video gen: text2vid, img2vid
│       ├── audio.py        # Audio enhance + MusicGen
│       ├── avatar.py       # Avatar upload, face detect, lip-sync animate
│       └── train.py        # LoRA fine-tuning (PEFT)
│
└── frontend/
    ├── package.json        # Next.js 15, React 19, Zustand 5, Tailwind CSS 4, lucide-react, clsx
    ├── tsconfig.json       # TypeScript config (path alias: @/ → src/)
    ├── postcss.config.js   # PostCSS with @tailwindcss/postcss
    ├── tailwind.config.ts  # Minimal (content paths only — theme is in globals.css @theme)
    └── src/
        ├── app/
        │   ├── layout.tsx       # Root layout: <html> + ThemeProvider + Sidebar + main
        │   ├── globals.css      # Design system: @theme tokens, CSS variable theming, components
        │   ├── page.tsx         # Chat page (home route "/")
        │   ├── voice/page.tsx   # Voice chat with mic recording
        │   ├── image/page.tsx   # Image gen — 3 tabs: text2img, img2img, fromTrained
        │   ├── video/page.tsx   # Video gen — 2 tabs: text2vid, img2vid
        │   ├── audio/page.tsx   # Audio — 2 tabs: generate music, enhance audio
        │   ├── avatar/page.tsx  # Avatar upload + lip-sync animate
        │   ├── train/page.tsx   # Training — 3 tabs: upload/train, jobs, models
        │   ├── gallery/page.tsx # Gallery — 3 tabs: images, videos, audio
        │   └── settings/page.tsx # Theme picker, system status, session management
        ├── components/
        │   ├── Sidebar.tsx      # Desktop sidebar (9 nav items) + mobile bottom nav + theme toggle
        │   └── ThemeProvider.tsx # Theme lifecycle: localStorage init, system preference listener
        ├── lib/
        │   └── api.ts           # API client: get/post/postForm/del helpers + 20+ endpoint functions
        └── store/
            ├── chat.ts          # Zustand: messages, session, loading, error, sendMessage()
            └── theme.ts         # Zustand: mode (light/dark/system), resolved, setMode()
```

---

## Theme System

Astra uses a CSS variable-based theming system with three modes: light, dark, and system.

### How It Works

1. **Flash prevention:** An inline `<script>` in `layout.tsx` reads `localStorage("astra-theme")` before React hydrates, setting `data-theme` on `<html>` to prevent theme flash.

2. **ThemeProvider** (`components/ThemeProvider.tsx`): Client component that:
   - Reads saved theme from `localStorage` key `"astra-theme"` on mount
   - Applies `data-theme` attribute and `colorScheme` CSS property to `<html>`
   - Listens to `prefers-color-scheme` media query changes (for system mode)
   - Saves mode changes to localStorage

3. **Theme store** (`store/theme.ts`): Zustand store with:
   - `mode`: `"light" | "dark" | "system"` — user's choice
   - `resolved`: `"light" | "dark"` — actual applied theme
   - `setMode()`, `setResolved()`

4. **CSS variables** (`globals.css`):
   - `@theme {}` block: constants (accent color `#7c5cfc`, status colors, border radii)
   - `:root, [data-theme="dark"]` block: dark theme variables
   - `[data-theme="light"]` block: light theme variables

### CSS Variables Available

| Variable | Dark | Light | Purpose |
|----------|------|-------|---------|
| `--color-bg` | `#060609` | `#f8f9fc` | Page background |
| `--color-surface` | `#0f0f14` | `#ffffff` | Card/panel background |
| `--color-surface-2` | `#1a1a23` | `#f0f1f5` | Elevated surface |
| `--color-surface-3` | `#242430` | `#e8e9f0` | Highest surface |
| `--color-border` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.08)` | Borders |
| `--color-text` | `#f0f0f5` | `#1a1a2e` | Primary text |
| `--color-text-secondary` | `#c0c0d0` | `#3a3a55` | Secondary text |
| `--color-muted` | `#8888a0` | `#6b6b80` | Muted/hint text |
| `--color-glass` | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.7)` | Glass background |
| `--color-input-bg` | `#0f0f14` | `#ffffff` | Input fields |

### Theming Pattern in Components

Components use CSS variables via inline styles instead of Tailwind color classes:

```tsx
// Text color
<p style={{ color: "var(--color-muted)" }}>Hint text</p>

// Background
<div style={{ background: "var(--color-surface)" }}>Card</div>

// Border
<div style={{ borderColor: "var(--color-border)" }}>Bordered</div>

// Accent colors (constant, work via Tailwind @theme)
<div style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>Accent</div>
```

Utility classes defined in globals.css (`.glass`, `.card`, `.input-base`, `.btn-primary`, `.tab-bar`, `.page-header`, `.alert`, `.empty-state`) already use CSS variables and work in both themes.

---

## API Routes

### Core

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Welcome message + feature list |
| GET | `/health` | Ollama connection status |
| GET | `/info` | Full config (model, version, features, paths) |

### Chat

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/chat` | Send message → get AI response |
| GET | `/sessions` | List all chat sessions |
| GET | `/history/{session}` | Get conversation history |
| DELETE | `/history/{session}` | Clear session history |

### Voice

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/voice` | Full voice chat (audio in → text + audio response) |
| POST | `/voice/stt` | Speech-to-text only |
| POST | `/voice/tts` | Text-to-speech only |
| WS | `/ws/voice` | Real-time streaming voice |

### Image

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/image/generate` | Text-to-image (prompt, model, steps, width, height, seed) |
| POST | `/image/from-image` | Image-to-image (file + prompt + strength) |
| POST | `/image/from-trained` | Generate using LoRA model (prompt, lora_path, trigger_word) |

### Video

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/video/generate` | Text-to-video (prompt, model, frames) |
| POST | `/video/from-image` | Image-to-video (file + prompt + frames) |

### Audio

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/audio/generate` | Generate music (prompt, duration) |
| POST | `/audio/enhance` | Enhance audio file (noise reduce, normalize) |

### Avatar

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/avatar/upload` | Upload face photo |
| GET | `/avatar/profile` | Get avatar profile data |
| POST | `/avatar/animate` | Generate lip-sync animation (text, duration) |

### Training

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/train/upload` | Upload training images (files[], dataset name) |
| POST | `/train/start` | Start LoRA fine-tuning (dataset, name, trigger_word, steps) |
| GET | `/train/status/{id}` | Job progress |
| GET | `/train/jobs` | All training jobs |
| GET | `/train/models` | List trained LoRA models |

### Gallery

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/gallery/images` | List generated images |
| GET | `/gallery/videos` | List generated videos |
| GET | `/gallery/audio` | List generated audio |

---

## Key Design Decisions

1. **Single-file services** — Each ML service is one file with a lazy singleton pattern.
2. **Lazy loading** — ML models only load when first used (saves startup memory). Services are imported inside route handlers.
3. **No auth** — Personal project, runs locally.
4. **No Docker in dev** — Runs on host directly.
5. **SQLite** — Zero-config database via SQLAlchemy 2.0.
6. **Storage dir** — All generated media saved to `backend/storage/`, served via FastAPI static files at `/storage/`.
7. **CSS variable theming** — All theme-dependent colors use CSS custom properties, not Tailwind classes. Components use `style={{ color: "var(--color-muted)" }}` pattern for theme reactivity.
8. **Flash prevention** — Inline script in `<head>` reads localStorage before paint to avoid theme flash on load.
9. **Mobile-first nav** — Bottom nav on mobile with slide-up "More" sheet for overflow items.
10. **Turbopack** — `npm run dev` uses `--turbopack` flag for fast HMR.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| LLM | Ollama + Mistral | latest |
| Backend | FastAPI | 0.115+ |
| Frontend | Next.js | 15 |
| UI Framework | React | 19 |
| Styling | Tailwind CSS | 4 |
| State | Zustand | 5 |
| Icons | Lucide React | 0.468+ |
| Markdown | react-markdown | 9 |
| Images | Stable Diffusion (diffusers) | latest |
| Video | ZeroScope / ModelScope / SVD | latest |
| Music | MusicGen (transformers) | latest |
| Speech | Whisper (STT) + piper-tts (TTS) | latest |
| Training | LoRA via PEFT | latest |
| Avatar | OpenCV + Pillow | latest |
| Database | SQLite + SQLAlchemy | 2.0 |
| Config | pydantic-settings | latest |

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

### Frontend: API call (JSON)

```typescript
export const doThing = (param: string) =>
    post("/endpoint", { param });
```

### Frontend: File upload (FormData)

```typescript
export async function uploadThing(file: File) {
    const form = new FormData();
    form.append("file", file);
    return postForm("/endpoint", form);
}
```

### Frontend: Theme-aware component

```tsx
// Use CSS variables for theme-dependent colors
<div
    className="rounded-xl p-4"
    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
>
    <p style={{ color: "var(--color-text)" }}>Title</p>
    <p style={{ color: "var(--color-muted)" }}>Description</p>
</div>

// Or use utility classes from globals.css
<div className="card">  {/* already theme-aware */}
<div className="alert alert-error">Error message</div>
<div className="alert alert-success">Success message</div>
<div className="empty-state">No items</div>
```

### Frontend: Page header pattern

```tsx
<header className="page-header">
    <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
             style={{ background: "var(--color-accent-subtle)" }}>
            <Icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
            <h1 className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>Title</h1>
            <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>Subtitle</p>
        </div>
    </div>
</header>
```

---

## Development

```bash
# Backend only
cd backend && source venv/bin/activate && python main.py

# Frontend only (with Turbopack HMR)
cd frontend && npm run dev

# Both together
./run.sh

# Build frontend for production
cd frontend && npm run build

# Check backend health
curl http://127.0.0.1:8000/health
```

---

## Sidebar Navigation (9 pages)

| Route | Label | Icon | Description |
|-------|-------|------|-------------|
| `/` | Chat | `MessageSquare` | Main chat interface |
| `/voice` | Voice | `Mic` | Voice conversation |
| `/image` | Image | `Image` | Image generation (3 tabs) |
| `/video` | Video | `Video` | Video generation (2 tabs) |
| `/audio` | Audio | `Music` | Music gen + audio enhance |
| `/avatar` | Avatar | `User` | Avatar upload + animate |
| `/train` | Train | `GraduationCap` | LoRA training |
| `/gallery` | Gallery | `LayoutGrid` | Browse generated media |
| `/settings` | Settings | `Settings` | Theme, status, sessions |

Mobile: first 4 items in bottom nav, remaining 5 in "More" slide-up sheet.

---

## Future Ideas

- Stream chat responses (SSE / server-sent events)
- Model switching from UI settings
- Conversation persistence to SQLite
- Export/import chat history
- Real-time video/image generation progress
- Voice cloning from avatar
