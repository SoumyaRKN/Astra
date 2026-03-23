"""Astra Configuration — loads settings from .env file."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Astra"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    # API
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    RELOAD: bool = True

    # Ollama
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral"
    OLLAMA_TIMEOUT: int = 120

    # LLM
    LLM_CONTEXT: int = 2048
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 512
    LLM_TOP_P: float = 0.9

    # Database
    DATABASE_URL: str = "sqlite:///./astra.db"

    # Paths
    ROOT: Path = Path(__file__).parent.parent
    BACKEND: Path = Path(__file__).parent
    STORAGE: Path = Path(__file__).parent / "storage"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Ensure storage exists
settings.STORAGE.mkdir(parents=True, exist_ok=True)
