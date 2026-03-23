"""Text-to-Speech Service — generates audio from text."""

import io
import wave
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)


class TTS:
    """Text-to-speech synthesis. Uses piper-tts when available, falls back to basic synthesis."""

    def __init__(self):
        self._engine = None
        self._init_engine()

    def _init_engine(self):
        try:
            import piper

            self._engine = "piper"
            logger.info("TTS engine: piper")
        except ImportError:
            self._engine = "basic"
            logger.info("TTS engine: basic (install piper-tts for better quality)")

    def synthesize(
        self, text: str, voice: Optional[str] = None, rate: int = 16000
    ) -> bytes:
        """Convert text to WAV audio bytes."""
        logger.info(f"Synthesizing ({self._engine}): {text[:50]}...")

        if self._engine == "piper":
            return self._piper_synth(text, voice)
        return self._basic_synth(text, rate)

    def _piper_synth(self, text: str, voice: Optional[str] = None) -> bytes:
        try:
            import piper

            model_path = voice or "en_US-lessac-medium"
            tts = piper.PiperVoice.load(model_path)
            buf = io.BytesIO()
            with wave.open(buf, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(22050)
                for chunk in tts.synthesize_stream_raw(text):
                    wf.writeframes(chunk)
            return buf.getvalue()
        except Exception as e:
            logger.warning(f"Piper synthesis failed, fallback to basic: {e}")
            return self._basic_synth(text)

    def _basic_synth(self, text: str, rate: int = 16000) -> bytes:
        """Generate simple tone-based audio as placeholder."""
        duration = max(1.0, len(text) / 15.0)
        samples = int(duration * rate)
        t = np.linspace(0, duration, samples, dtype=np.float32)
        # Generate a gentle tone modulated by text length
        freq = 220 + (len(text) % 200)
        audio = 0.3 * np.sin(2 * np.pi * freq * t) * np.exp(-t / duration)
        pcm = (audio * 32767).astype(np.int16)

        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(rate)
            wf.writeframes(pcm.tobytes())
        return buf.getvalue()

    def info(self) -> dict:
        return {"engine": self._engine}


# Lazy singleton
_tts = None


def get_tts() -> TTS:
    global _tts
    if _tts is None:
        _tts = TTS()
    return _tts
