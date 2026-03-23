"""
Conversation Memory Management

Handles conversation history and context for multi-turn conversations.
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ConversationMemory:
    """
    In-memory conversation storage for multi-turn chat.

    TODO: Persist to database in future phases.
    """

    def __init__(self):
        """Initialize conversation memory"""
        self.conversations: Dict[str, List[Dict]] = {}
        logger.info("💾 Conversation memory initialized")

    def add_message(self, conversation_id: str, role: str, content: str) -> None:
        """
        Add a message to conversation history.

        Args:
            conversation_id: Unique conversation identifier
            role: "user" or "assistant"
            content: Message content
        """
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []

        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.conversations[conversation_id].append(message)
        logger.debug(f"Added {role} message to {conversation_id}")

    def get_context(self, conversation_id: str, max_messages: int = 5) -> str:
        """
        Get formatted context from recent conversation history.

        Args:
            conversation_id: Unique conversation identifier
            max_messages: Maximum number of recent messages to include

        Returns:
            Formatted context string for LLM
        """
        if conversation_id not in self.conversations:
            return ""

        messages = self.conversations[conversation_id][-max_messages:]

        context_lines = []
        for msg in messages:
            role = msg["role"].capitalize()
            content = msg["content"]
            context_lines.append(f"{role}: {content}")

        return "\n".join(context_lines)

    def get_full_history(self, conversation_id: str) -> List[Dict]:
        """
        Get complete conversation history.

        Args:
            conversation_id: Unique conversation identifier

        Returns:
            List of all messages in conversation
        """
        return self.conversations.get(conversation_id, [])

    def clear_conversation(self, conversation_id: str) -> None:
        """
        Clear conversation history.

        Args:
            conversation_id: Unique conversation identifier
        """
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            logger.info(f"Cleared conversation {conversation_id}")

    def get_summary(self, conversation_id: str) -> Dict:
        """
        Get conversation summary.

        Args:
            conversation_id: Unique conversation identifier

        Returns:
            Dict with conversation stats
        """
        if conversation_id not in self.conversations:
            return {"exists": False}

        messages = self.conversations[conversation_id]
        user_count = sum(1 for m in messages if m["role"] == "user")
        assistant_count = sum(1 for m in messages if m["role"] == "assistant")

        return {
            "exists": True,
            "conversation_id": conversation_id,
            "total_messages": len(messages),
            "user_messages": user_count,
            "assistant_messages": assistant_count,
        }
