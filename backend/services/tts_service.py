"""
Text-to-Speech Service using CosyVoice

Generates speech from text, with optional voice cloning for user's voice.
"""

import logging
from typing import Optional
from .voice_clone_service import VoiceProfile, get_voice_cloning_service

logger = logging.getLogger(__name__)


class TTSService:
    """Text-to-Speech service"""

    def __init__(self, use_cloned_voice: bool = True):
        """
        Initialize TTS service

        Args:
            use_cloned_voice: Whether to use voice cloning service
        """
        self.use_cloned_voice = use_cloned_voice
        self.voice_cloning = get_voice_cloning_service() if use_cloned_voice else None
        logger.info(f"TTS service initialized (cloned_voice={use_cloned_voice})")

        # In production: Load CosyVoice model
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load TTS model"""
        try:
            logger.info("Loading TTS model...")
            # TODO: Load actual CosyVoice model or alternative TTS
            # For MVP: Simulate
            self.model = {"status": "loaded", "type": "cosyvoice"}
            logger.info("✅ TTS model loaded")
        except Exception as e:
            logger.error(f"Warning: Could not load TTS model: {e}")
            # Continue anyway - will use voice cloning fallback

    def synthesize_with_cloned_voice(
        self, text: str, voice_profile: VoiceProfile, language: str = "en"
    ) -> bytes:
        """
        Synthesize speech using user's cloned voice

        Uses voice cloning service to generate speech with user's voice.

        Args:
            text: Text to synthesize
            voice_profile: Trained voice profile
            language: Language code

        Returns:
            Audio bytes (16kHz mono WAV)
        """
        try:
            if not self.use_cloned_voice or not self.voice_cloning:
                raise ValueError("Voice cloning not enabled")

            logger.info(f"Synthesizing with cloned voice: '{text[:30]}...'")

            # Delegate to voice cloning service
            audio_bytes = self.voice_cloning.synthesize(text, voice_profile, language)

            logger.info(f"✅ Cloned voice synthesis complete: {len(audio_bytes)} bytes")
            return audio_bytes
        except Exception as e:
            logger.error(f"❌ Cloned voice synthesis failed: {e}")
            raise

    def synthesize_with_default_voice(
        self, text: str, voice_id: str = "default", language: str = "en"
    ) -> bytes:
        """
        Synthesize speech using default voice

        Fallback if user hasn't provided voice cloning samples.

        Args:
            text: Text to synthesize
            voice_id: Default voice identifier
            language: Language code

        Returns:
            Audio bytes (16kHz mono WAV)
        """
        try:
            logger.info(f"Synthesizing with default voice: '{text[:30]}...'")

            if not self.model:
                raise RuntimeError("TTS model not loaded")

            # In production: Use TTS model to synthesize
            # For MVP: Create dummy audio
            import numpy as np
            import io
            import wave

            duration_seconds = len(text) / 15  # Rough estimate
            sample_rate = 16000
            num_samples = int(duration_seconds * sample_rate)

            # Generate random audio
            audio = np.random.randn(num_samples).astype(np.float32) * 0.1

            # Convert to WAV bytes
            with io.BytesIO() as wav_buffer:
                with wave.open(wav_buffer, "wb") as wav_file:
                    wav_file.setnchannels(1)  # Mono
                    wav_file.setsampwidth(2)  # 16-bit
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes((audio * 32767).astype(np.int16).tobytes())

                wav_bytes = wav_buffer.getvalue()

            logger.info(f"✅ Default voice synthesis complete: {len(wav_bytes)} bytes")
            return wav_bytes
        except Exception as e:
            logger.error(f"❌ Default voice synthesis failed: {e}")
            raise

    def synthesize(
        self,
        text: str,
        voice_profile: Optional[VoiceProfile] = None,
        language: str = "en",
    ) -> bytes:
        """
        Synthesize speech (smart router)

        Uses cloned voice if available, otherwise uses default voice.

        Args:
            text: Text to synthesize
            voice_profile: Optional trained voice profile
            language: Language code

        Returns:
            Audio bytes (16kHz mono WAV)
        """
        if voice_profile and self.use_cloned_voice:
            return self.synthesize_with_cloned_voice(text, voice_profile, language)
        else:
            return self.synthesize_with_default_voice(text, language=language)

    def get_available_voices(self) -> list:
        """Get list of available default voices"""
        return [
            {"id": "default", "name": "Default", "language": "multi"},
            # Would add more in production
        ]

    def get_service_info(self) -> dict:
        """Get service information"""
        return {
            "status": "ready" if self.model else "not-ready",
            "cloned_voice_enabled": self.use_cloned_voice,
            "available_voices": self.get_available_voices(),
        }


# Singleton instance
_tts_service = None


def get_tts_service(use_cloned_voice: bool = True) -> TTSService:
    """Get or create TTS service singleton"""
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService(use_cloned_voice)
    return _tts_service
