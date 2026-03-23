"""
Voice Pipeline Orchestrator (Pipecat)

Orchestrates the complete voice conversation pipeline:
Audio Input → STT → LLM → TTS → Audio Output
"""

import logging
import asyncio
from typing import AsyncIterator, Optional
from io import BytesIO

from .stt_service import get_stt_service
from .voice_clone_service import get_voice_cloning_service, VoiceProfile
from .tts_service import get_tts_service
from backend.services.llm_service import get_llm_service
from backend.memory.conversation_memory import ConversationMemory

logger = logging.getLogger(__name__)


class VoicePipelineOrchestrator:
    """Orchestrates real-time voice conversation pipeline"""

    def __init__(self):
        """Initialize all voice services"""
        logger.info("Initializing Voice Pipeline Orchestrator...")

        self.stt = get_stt_service()
        self.voice_cloner = get_voice_cloning_service()
        self.tts = get_tts_service()
        self.llm = get_llm_service()
        self.memory = ConversationMemory()

        logger.info("✅ Voice Pipeline ready")

    async def process_voice_input(
        self,
        audio_bytes: bytes,
        user_id: str,
        voice_profile: Optional[VoiceProfile] = None,
        language: str = None,
    ) -> dict:
        """
        Process voice input through complete pipeline

        Flow:
        1. STT: Convert audio to text
        2. Memory: Add user message
        3. LLM: Generate response
        4. Memory: Add assistant message
        5. TTS: Synthesize response with voice

        Args:
            audio_bytes: Audio data (16kHz mono WAV)
            user_id: User identifier
            voice_profile: Optional trained voice profile for synthesis
            language: Language code or None for auto-detect

        Returns:
            {
                "user_text": "What is the weather?",
                "assistant_text": "It is sunny...",
                "audio": b"...",  # WAV bytes
                "latency": 12.5   # seconds
            }
        """
        try:
            import time

            start_time = time.time()

            logger.info("🎤 Voice pipeline: Starting audio processing")

            # Step 1: Speech-to-Text (2-5 seconds)
            logger.info("  1️⃣ STT: Transcribing audio...")
            stt_result = self.stt.transcribe_bytes(audio_bytes, language)
            user_text = stt_result["text"]
            detected_language = stt_result.get("language", "en")
            logger.info(f"  ✅ STT complete: '{user_text[:50]}'")

            # Step 2: Add to conversation memory
            logger.info("  2️⃣ Adding to conversation history...")
            self.memory.add_message("user", user_text)
            logger.info("  ✅ Message added")

            # Step 3: Get LLM response (5-10 seconds)
            logger.info("  3️⃣ LLM: Generating response...")
            context = self.memory.get_context()
            assistant_text = await asyncio.to_thread(
                self.llm.get_response, user_text, context
            )
            logger.info(f"  ✅ LLM complete: '{assistant_text[:50]}'")

            # Step 4: Add response to memory
            logger.info("  4️⃣ Adding response to history...")
            self.memory.add_message("assistant", assistant_text)
            logger.info("  ✅ Response added")

            # Step 5: Text-to-Speech synthesis (1-2 seconds)
            logger.info("  5️⃣ TTS: Synthesizing speech...")
            response_audio = await asyncio.to_thread(
                self.tts.synthesize, assistant_text, voice_profile, detected_language
            )
            logger.info(f"  ✅ TTS complete: {len(response_audio)} bytes")

            latency = time.time() - start_time

            logger.info(f"🎉 Voice pipeline complete ({latency:.1f}s)")

            return {
                "user_text": user_text,
                "assistant_text": assistant_text,
                "audio": response_audio,
                "latency": latency,
                "language": detected_language,
            }

        except Exception as e:
            logger.error(f"❌ Voice pipeline error: {e}")
            raise

    async def stream_voice_chunks(
        self,
        audio_stream: AsyncIterator[bytes],
        user_id: str,
        voice_profile: Optional[VoiceProfile] = None,
        language: str = None,
    ):
        """
        Stream-based voice processing for WebSocket

        Accumulates audio chunks and processes them periodically.

        Args:
            audio_stream: Async iterator of audio chunks
            user_id: User identifier
            voice_profile: Optional voice profile
            language: Language code

        Yields:
            Processed voice responses (audio + text)
        """
        accumulated_audio = BytesIO()
        chunk_threshold = 32000  # ~1 second of 16kHz audio

        try:
            async for audio_chunk in audio_stream:
                accumulated_audio.write(audio_chunk)

                # Process if we have enough audio
                if accumulated_audio.tell() > chunk_threshold:
                    audio_data = accumulated_audio.getvalue()

                    # Process through pipeline
                    result = await self.process_voice_input(
                        audio_data, user_id, voice_profile, language
                    )

                    yield result

                    # Reset for next chunk
                    accumulated_audio = BytesIO()

        except Exception as e:
            logger.error(f"Error in stream processing: {e}")
            raise

    def reset_conversation(self, user_id: str = "default"):
        """Reset conversation memory"""
        self.memory.clear_conversation()
        logger.info(f"Conversation reset for user {user_id}")

    def get_conversation_history(self) -> list:
        """Get current conversation history"""
        return self.memory.get_full_history()

    def get_status(self) -> dict:
        """Get orchestrator status"""
        return {
            "status": "ready",
            "stt": self.stt.get_model_info(),
            "tts": self.tts.get_service_info(),
            "conversation_length": len(self.memory.get_full_history()),
        }


# Singleton instance
_orchestrator = None


def get_voice_orchestrator() -> VoicePipelineOrchestrator:
    """Get or create voice orchestrator singleton"""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = VoicePipelineOrchestrator()
    return _orchestrator
