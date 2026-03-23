"""Speech-to-Text Service — uses OpenAI Whisper for local transcription."""

import logging
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

_model = None


def _get_model(size: str = "base"):
    global _model
    if _model is None:
        import whisper

        logger.info(f"Loading Whisper model: {size}")
        _model = whisper.load_model(size)
        logger.info(f"Whisper {size} model loaded")
    return _model


class STT:
    """Speech-to-text using OpenAI Whisper."""

    def __init__(self, model_size: str = "base"):
        self.size = model_size
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = _get_model(self.size)
        return self._model

    def transcribe_file(self, path: str, language: Optional[str] = None) -> dict:
        logger.info(f"Transcribing: {path}")
        result = self.model.transcribe(
            path, language=language, verbose=False, fp16=False
        )
        text = result.get("text", "").strip()
        lang = result.get("language", "en")
        logger.info(f"Transcribed ({lang}): {text[:60]}...")
        return {"text": text, "language": lang}

    def transcribe_bytes(self, audio: bytes, language: Optional[str] = None) -> dict:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as f:
            f.write(audio)
            f.flush()
            return self.transcribe_file(f.name, language)

    def detect_language(self, path: str) -> str:
        import whisper

        audio = whisper.load_audio(path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio).to(self.model.device)
        _, probs = self.model.detect_language(mel)
        return max(probs, key=probs.get)

    def info(self) -> dict:
        return {"model": self.size, "loaded": self._model is not None}
