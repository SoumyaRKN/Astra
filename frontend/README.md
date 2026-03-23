# Frontend Setup Instructions

## Overview

The frontend is a **Next.js + React** application that provides the web interface for the Personal AI Assistant.

**Status:** Phase 4 (Frontend development starts after Phase 3)

## Setup

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Access at <http://localhost:3000>

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.js
│
├── src/
│   ├── app/
│   │   ├── layout.tsx      ← Root layout
│   │   ├── page.tsx        ← Main chat page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ChatWindow.tsx  ← Message display
│   │   ├── MessageBubble.tsx
│   │   ├── AvatarDisplay.tsx ← Avatar video
│   │   ├── VoiceInput.tsx  ← Mic button
│   │   ├── SettingsPanel.tsx
│   │   └── Header.tsx
│   │
│   ├── hooks/
│   │   ├── useChat.ts      ← WebSocket connection
│   │   ├── useVoiceRecord.ts ← Web Audio API
│   │   └── useSettings.ts  ← Settings state
│   │
│   └── services/
│       └── api.ts          ← API client
│
└── public/
```

## Implementation Timeline

- **Phase 4 Week 1:** Setup Next.js + basic layout
- **Phase 4 Week 2:** Chat interface component
- **Phase 4 Week 3:** WebSocket integration
- **Phase 4 Week 4:** Avatar display + settings

## Technologies

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State:** Zustand
- **Animation:** Framer Motion
- **HTTP:** Axios
- **Real-time:** WebSocket (native) / Socket.IO (optional)

## API Integration

The frontend communicates with the backend via:

1. **REST API** (for initial calls)

   ```typescript
   POST /chat
   {
     "message": string,
     "conversation_id": string
   }
   ```

2. **WebSocket** (for real-time voice, Phase 2+)

   ```
   ws://localhost:8000/ws/voice
   ```

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Notes

- Phase 4 starts after Phase 3 (Avatar) is complete
- Frontend needs backend running locally
- See [PROJECT_PLAN.md](../PROJECT_PLAN.md) for details

## Troubleshooting

**Port 3000 already in use:**

```bash
npm run dev -- -p 3001
```

**Modules not found:**

```bash
npm install
```

## Next Steps

- Initialize Next.js project (Phase 4)
- Create Chat UI components
- Implement WebSocket connection
- Add voice input integration
