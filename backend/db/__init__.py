"""
Database Module

Handles database connections and models.
"""

import logging
from .database import init_db, get_db, reset_db, engine, SessionLocal
from .models import (
    Base,
    Conversation,
    Message,
    VoiceProfile,
    VoiceSample,
    Avatar,
    GeneratedImage,
    GeneratedVideo,
    UserPreferences,
)

logger = logging.getLogger(__name__)

__all__ = [
    "init_db",
    "get_db",
    "reset_db",
    "engine",
    "SessionLocal",
    # Models
    "Base",
    "Conversation",
    "Message",
    "VoiceProfile",
    "VoiceSample",
    "Avatar",
    "GeneratedImage",
    "GeneratedVideo",
    "UserPreferences",
]


def init_db():
    """
    Initialize database.

    TODO: Implement SQLAlchemy setup in Phase 2
    """
    logger.info("Database initialization placeholder (Phase 2)")
    pass
