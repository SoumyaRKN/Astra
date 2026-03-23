# API Reference

Complete reference of all backend API endpoints.

**Base URL:** `http://localhost:8000`  
**API Version:** 0.1.0  
**Status:** Phase 1 (Chat endpoints only)

---

## Health & Info Endpoints

### GET /

**Description:** Welcome endpoint with available endpoints

**Response:**

```json
{
  "message": "Welcome to Personal AI Assistant Backend",
  "version": "0.1.0",
  "endpoints": {
    "health": "/health",
    "chat": "/chat",
    "docs": "/docs",
    "openapi": "/openapi.json"
  }
}
```

---

### GET /health

**Description:** Check backend and service health

**Response:**

```json
{
  "status": "healthy",
  "ollama_connected": true,
  "database_connected": true,
  "model": "mistral:3b-instruct-q4_K_M"
}
```

**Status Codes:**

- `200 OK` — All services healthy
- `200 OK status=degraded` — Some services down (check response fields)

---

### GET /info

**Description:** Get detailed system configuration and information

**Response:**

```json
{
  "app_name": "Personal AI Assistant",
  "version": "0.1.0",
  "environment": "development",
  "ollama": {
    "base_url": "http://localhost:11434",
    "model": "mistral:3b-instruct-q4_K_M",
    "timeout": 120
  },
  "llm": {
    "context_length": 2048,
    "temperature": 0.7,
    "max_tokens": 512,
    "top_p": 0.9
  },
  "database": {
    "type": "SQLite",
    "url": "sqlite:///./conversations.db"
  }
}
```

---

## Chat Endpoints

### POST /chat

**Description:** Send message and get LLM response

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "conversation_id": "conv_123",
  "include_history": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's message |
| `conversation_id` | string | No | Unique conversation ID (default: "default") |
| `include_history` | boolean | No | Include conversation history (default: true) |

**Response:**

```json
{
  "conversation_id": "conv_123",
  "user_message": "Hello, how are you?",
  "assistant_response": "I'm doing well, thank you for asking! How can I help you today?",
  "tokens_used": 47,
  "processing_time_ms": 5230
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `conversation_id` | string | The conversation this belongs to |
| `user_message` | string | Echo of user's input |
| `assistant_response` | string | LLM's response |
| `tokens_used` | integer | Approximate tokens used |
| `processing_time_ms` | float | Time taken in milliseconds |

**Status Codes:**

- `200 OK` — Successful response
- `400 Bad Request` — Message is empty or missing
- `500 Internal Server Error` — LLM error or Ollama not responding
- `504 Gateway Timeout` — Request took too long (>120 sec)

**Curl Examples:**

Basic request:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!"
  }'
```

With conversation ID:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What did I just say?",
    "conversation_id": "user_session_1",
    "include_history": true
  }'
```

---

## WebSocket Endpoints (Phase 2+)

**Planned endpoints (not yet implemented):**

- `WebSocket /ws/voice` — Real-time voice conversation
- `WebSocket /ws/stream` — Streaming responses

---

## Error Responses

**400 Bad Request:**

```json
{
  "detail": "Message cannot be empty"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "LLM service error: Connection refused"
}
```

---

## Interactive API Documentation

**Swagger UI:** <http://localhost:8000/docs>  
**ReDoc:** <http://localhost:8000/redoc>  
**OpenAPI Schema:** <http://localhost:8000/openapi.json>

Visit `/docs` for interactive testing of all endpoints!

---

## Testing Tips

### Using curl

```bash
# Simple request
curl http://localhost:8000/health

# POST with JSON
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Pretty print JSON
curl http://localhost:8000/info | python -m json.tool
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/chat",
    json={"message": "Hello!"}
)
print(response.json())
```

### Using JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'Hello!'})
});
const data = await response.json();
console.log(data);
```

---

## Rate Limiting

**Phase 1:** No rate limiting (development only)

**Phase 5+:** Will add:

- 10 requests/second per IP
- 100 messages/minute per conversation
- 1 MB max request size

---

## API Versioning

**Current:** Version 0.1.0 (Phase 1)

**Strategy:**

- Backward compatibility maintained until major version bump
- New features will not break existing endpoints
- Breaking changes increment major version

---

## Future Endpoints (Planned)

Phase 2+:

```
GET    /conversations              — List all conversations
GET    /conversations/{id}         — Get conversation details
DELETE /conversations/{id}         — Clear conversation
GET    /conversations/{id}/export  — Export as JSON

GET    /settings                   — Get user settings
POST   /settings                   — Update settings

WebSocket /ws/voice               — Real-time voice chat
WebSocket /ws/stream              — Streaming responses
```

---

## Development Notes

- All timestamps are in UTC (ISO 8601 format)
- All endpoints require JSON response type
- CORS: Allows all origins in development (will restrict in production)
- Authentication: None in Phase 1 (personal use only)

---

See [backend/README.md](../backend/README.md) for implementation details.
