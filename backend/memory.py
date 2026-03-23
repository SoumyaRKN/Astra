"""Conversation memory — tracks chat history for context."""

import logging
from typing import Dict, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class Memory:
    """In-memory conversation storage for multi-turn chat."""

    def __init__(self):
        self._store: Dict[str, List[Dict]] = {}

    def add(self, session_id: str, role: str, content: str) -> None:
        if session_id not in self._store:
            self._store[session_id] = []
        self._store[session_id].append(
            {
                "role": role,
                "content": content,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

    def context(self, session_id: str, limit: int = 10) -> str:
        if session_id not in self._store:
            return ""
        messages = self._store[session_id][-limit:]
        return "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in messages)

    def history(self, session_id: str) -> List[Dict]:
        return self._store.get(session_id, [])

    def clear(self, session_id: str) -> None:
        self._store.pop(session_id, None)

    def sessions(self) -> List[str]:
        return list(self._store.keys())
