"""
Database Connection and Session Management

SQLite for local development, PostgreSQL for production.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from typing import Generator

from backend.config import settings

logger = logging.getLogger(__name__)

# Create Base for ORM models
Base = declarative_base()

# Get database URL from settings
DATABASE_URL = settings.DATABASE_URL

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,  # Set to True for SQL debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables

    Creates all tables defined in models.py
    """
    try:
        logger.info("Initializing database...")

        # Import models to register them with Base
        from .models import Base

        # Create all tables
        Base.metadata.create_all(bind=engine)

        logger.info("✅ Database tables created successfully")
        logger.info("   Tables:")
        logger.info("   - conversations")
        logger.info("   - messages")
        logger.info("   - voice_profiles")
        logger.info("   - voice_samples")
        logger.info("   - avatars")
        logger.info("   - generated_images")
        logger.info("   - generated_videos")
        logger.info("   - user_preferences")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


def reset_db():
    """
    WARNING: Drop and recreate all tables

    Only use for testing/development!
    """
    logger.warning("⚠️ WARNING: Dropping all database tables!")

    from .models import Base

    Base.metadata.drop_all(bind=engine)
    logger.warning("All tables dropped")

    init_db()
    logger.info("✅ Database reset complete")
