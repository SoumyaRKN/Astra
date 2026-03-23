"""
Database Models using SQLAlchemy ORM

Defines all database tables and relationships.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    LargeBinary,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Conversation(Base):
    """Stores conversation sessions"""

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    voice_profile_id = Column(Integer, ForeignKey("voice_profiles.id"), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    mode = Column(String, default="text")  # "text" or "voice"

    # Relationships
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )


class Message(Base):
    """Individual messages in conversations"""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)  # "user" or "assistant"
    content = Column(Text)  # Text message
    audio_path = Column(String, nullable=True)  # Path to audio if voice mode
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


class VoiceProfile(Base):
    """Trained voice profiles for users"""

    __tablename__ = "voice_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    voice_name = Column(String, default="default")
    speaker_embedding = Column(
        LargeBinary
    )  # Serialized numpy array of voice characteristics
    sample_rate = Column(Integer, default=16000)
    trained_at = Column(DateTime, default=datetime.utcnow)
    num_samples = Column(Integer)
    model_path = Column(String)  # Path to saved model file

    # Relationships
    samples = relationship(
        "VoiceSample", back_populates="profile", cascade="all, delete-orphan"
    )


class VoiceSample(Base):
    """Individual voice samples used for training"""

    __tablename__ = "voice_samples"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("voice_profiles.id"))
    user_id = Column(String, index=True)
    audio_path = Column(String)  # Path to stored audio file
    duration = Column(Float)  # Duration in seconds
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("VoiceProfile", back_populates="samples")


class Avatar(Base):
    """Avatar configurations and photos"""

    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    avatar_name = Column(String, default="default")
    photo_path = Column(String)  # Path to user photo
    animation_data = Column(LargeBinary, nullable=True)  # Cached animation data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GeneratedImage(Base):
    """Cached generated images"""

    __tablename__ = "generated_images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    prompt = Column(Text)  # Generation prompt
    image_path = Column(String)  # Path to generated image
    model_used = Column(String)  # Which model generated it
    created_at = Column(DateTime, default=datetime.utcnow)
    generation_time = Column(Float)  # Seconds to generate


class GeneratedVideo(Base):
    """Cached generated videos"""

    __tablename__ = "generated_videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    prompt = Column(Text)  # Generation prompt
    video_path = Column(String)  # Path to generated video
    duration = Column(Float)  # Video duration in seconds
    model_used = Column(String)  # Which model generated it
    created_at = Column(DateTime, default=datetime.utcnow)
    generation_time = Column(Float)  # Seconds to generate


class UserPreferences(Base):
    """User preferences and settings"""

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    preferred_language = Column(String, default="en")
    enable_voice = Column(Integer, default=1)  # Boolean
    enable_avatar = Column(Integer, default=1)  # Boolean
    voice_profile_id = Column(Integer, ForeignKey("voice_profiles.id"), nullable=True)
    avatar_id = Column(Integer, ForeignKey("avatars.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
