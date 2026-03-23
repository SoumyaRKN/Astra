"""Voice Pipeline — STT → LLM → TTS orchestration for voice chat."""

import io
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class Voice:
    """Orchestrates real-time voice conversation: Audio → Text → LLM → Speech."""

    def __init__(self):
        from services.stt import STT
        from services.tts import TTS
        from llm import llm as _llm

        self.stt = STT()
        self.tts = TTS()
        self.llm = _llm
        logger.info("Voice pipeline ready")

    async def process(
        self, audio: bytes, session: str = "default", language: Optional[str] = None
    ) -> dict:
        """
        Process voice input through full pipeline.

        Returns: {user_text, response, audio, time_ms}
        """
        start = time.time()

        # 1. Speech to text
        logger.info("Voice: transcribing...")
        result = self.stt.transcribe_bytes(audio, language)
        user_text = result["text"]
        lang = result.get("language", "en")
        logger.info(f"Voice: heard '{user_text[:60]}...'")

        # 2. LLM response
        logger.info("Voice: generating response...")
        llm_result = await self.llm.chat(user_text, session)
        response_text = llm_result["response"]
        logger.info(f"Voice: response '{response_text[:60]}...'")

        # 3. Text to speech
        logger.info("Voice: synthesizing...")
        response_audio = self.tts.synthesize(response_text)
        logger.info(f"Voice: synthesized {len(response_audio)} bytes")

        elapsed = (time.time() - start) * 1000

        return {
            "user_text": user_text,
            "response": response_text,
            "audio": response_audio,
            "language": lang,
            "time_ms": elapsed,
        }

    def info(self) -> dict:
        return {
            "stt": self.stt.info(),
            "tts": self.tts.info(),
        }


# Lazy singleton
_voice = None


def get_voice() -> Voice:
    global _voice
    if _voice is None:
        _voice = Voice()
    return _voice
