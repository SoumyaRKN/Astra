"""Database models — SQLAlchemy ORM."""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)  # "user" or "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class GeneratedMedia(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String, index=True)  # "image", "video", "audio"
    prompt = Column(Text)
    path = Column(String)
    model = Column(String, nullable=True)
    duration = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
