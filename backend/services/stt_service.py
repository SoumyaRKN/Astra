"""
Speech-to-Text Service using OpenAI Whisper

Converts audio to text. Runs locally, offline, supports multiple languages.
"""

import logging
import whisper
from io import BytesIO
from pathlib import Path
import numpy as np

logger = logging.getLogger(__name__)


class STTService:
    """Speech-to-Text service using Whisper"""

    def __init__(self, model_size: str = "base"):
        """
        Initialize STT service with Whisper model

        Args:
            model_size: Whisper model size
                - tiny: 39MB, ~10x faster but less accurate
                - base: 140MB, good balance (recommended)
                - small: 466MB, better accuracy
                - medium: 1.5GB, high accuracy
                - large: 3GB, highest accuracy
        """
        logger.info(f"Loading Whisper model: {model_size}")
        self.model_size = model_size
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load Whisper model"""
        try:
            self.model = whisper.load_model(self.model_size)
            logger.info(f"✅ Whisper {self.model_size} model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load Whisper model: {e}")
            raise

    def transcribe_file(self, audio_path: str, language: str = None) -> dict:
        """
        Transcribe audio file to text

        Args:
            audio_path: Path to audio file (WAV, MP3, M4A, etc.)
            language: Language code (e.g., 'en', 'es', 'ja') or None for auto-detect

        Returns:
            {
                "text": "Transcribed text",
                "language": "en",
                "duration": 5.5,
                "segments": [...]  # Optional detailed segments
            }
        """
        try:
            logger.info(f"Transcribing: {audio_path}")

            result = self.model.transcribe(
                audio_path,
                language=language,
                verbose=False,
                fp16=False,  # Disable fp16 for CPU compatibility
            )

            logger.info(f"✅ Transcription complete: {result['text'][:50]}...")

            return {
                "text": result["text"],
                "language": result.get("language"),
                "segments": result.get("segments", []),
            }
        except Exception as e:
            logger.error(f"❌ Transcription failed: {e}")
            raise

    def transcribe_bytes(self, audio_bytes: bytes, language: str = None) -> dict:
        """
        Transcribe audio from bytes to text

        Useful for streaming audio or in-memory audio processing

        Args:
            audio_bytes: Audio data as bytes (16kHz mono WAV recommended)
            language: Language code or None for auto-detect

        Returns:
            Same as transcribe_file()
        """
        try:
            # Save bytes to temporary WAV
            import tempfile

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            # Transcribe
            result = self.transcribe_file(tmp_path, language)

            # Clean up
            Path(tmp_path).unlink()

            return result
        except Exception as e:
            logger.error(f"❌ Bytes transcription failed: {e}")
            raise

    def detect_language(self, audio_path: str) -> str:
        """
        Detect language of audio file

        Args:
            audio_path: Path to audio file

        Returns:
            Language code (e.g., 'en', 'es', 'ja')
        """
        try:
            logger.info(f"Detecting language for: {audio_path}")

            # Load audio
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)

            # Get mel spectrogram
            mel = whisper.log_mel_spectrogram(audio).to(self.model.device)

            # Detect language
            _, probs = self.model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)

            logger.info(f"✅ Detected language: {detected_lang}")

            return detected_lang
        except Exception as e:
            logger.error(f"❌ Language detection failed: {e}")
            return "en"  # Fallback to English

    def get_model_info(self) -> dict:
        """Get information about loaded model"""
        return {
            "model_size": self.model_size,
            "status": "loaded",
            "device": str(self.model.device) if self.model else "unknown",
        }


# Singleton instance for reuse
_stt_service = None


def get_stt_service(model_size: str = "base") -> STTService:
    """Get or create STT service singleton"""
    global _stt_service
    if _stt_service is None:
        _stt_service = STTService(model_size)
    return _stt_service
