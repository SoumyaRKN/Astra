"""
Configuration Management for Personal AI Assistant Backend

Handles environment variables, paths, and settings.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "Personal AI Assistant"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # API Configuration
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    API_RELOAD: bool = True

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral:3b-instruct-q4_K_M"
    OLLAMA_TIMEOUT: int = 120  # seconds

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./conversations.db"
    SQLALCHEMY_ECHO: bool = False

    # File paths
    PROJECT_ROOT: Path = Path(__file__).parent.parent.parent
    BACKEND_ROOT: Path = Path(__file__).parent
    MODELS_DIR: Path = PROJECT_ROOT / "models"
    DATA_DIR: Path = PROJECT_ROOT / "data"
    LOG_DIR: Path = DATA_DIR / "logs"

    # LLM Parameters
    LLM_CONTEXT_LENGTH: int = 2048
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 512
    LLM_TOP_P: float = 0.9

    # Voice Settings
    VOICE_ENABLED: bool = True
    VOICE_SAMPLE_RATE: int = 16000
    VOICE_CHUNK_SIZE: int = 1024

    class Config:
        env_file = ".env"
        case_sensitive = True


# Initialize settings
settings = Settings()

# Ensure directories exist
settings.LOG_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    print("Settings loaded successfully!")
    print(f"Project Root: {settings.PROJECT_ROOT}")
    print(f"Backend Root: {settings.BACKEND_ROOT}")
    print(f"Ollama Base URL: {settings.OLLAMA_BASE_URL}")
    print(f"Ollama Model: {settings.OLLAMA_MODEL}")
    print(f"Database: {settings.DATABASE_URL}")
