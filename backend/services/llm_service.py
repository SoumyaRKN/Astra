"""
LLM Service - Integrates with Ollama and Langchain

Handles all LLM-based operations including:
- Chat completion requests
- Context management
- Response streaming
- Memory management
"""

import asyncio
import time
import logging
from typing import Optional, Dict, Any
import aiohttp

from backend.config import settings
from backend.memory.conversation_memory import ConversationMemory

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM operations via Ollama"""

    def __init__(self):
        """Initialize LLM service"""
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.top_p = settings.LLM_TOP_P
        self.memory = ConversationMemory()
        self.timeout = aiohttp.ClientTimeout(total=settings.OLLAMA_TIMEOUT)

        logger.info(f"🧠 LLM Service initialized with model: {self.model}")

    async def check_ollama_health(self) -> bool:
        """
        Check if Ollama service is running and accessible.

        Returns:
            bool: True if Ollama is healthy, False otherwise
        """
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(f"{self.ollama_url}/api/tags") as resp:
                    if resp.status == 200:
                        logger.info("✅ Ollama health check passed")
                        return True
                    else:
                        logger.warning(f"⚠️  Ollama returned status {resp.status}")
                        return False
        except asyncio.TimeoutError:
            logger.error("❌ Ollama health check timed out")
            return False
        except Exception as e:
            logger.error(f"❌ Ollama health check failed: {e}")
            return False

    async def get_response(
        self,
        message: str,
        conversation_id: str = "default",
        include_history: bool = True,
    ) -> Dict[str, Any]:
        """
        Get LLM response for a user message.

        Args:
            message: User's input message
            conversation_id: Unique conversation identifier
            include_history: Whether to include conversation history

        Returns:
            Dict containing:
            - response: LLM's response text
            - conversation_id: The conversation ID
            - tokens: Number of tokens used
            - processing_time_ms: Time taken to generate response
        """
        start_time = time.time()

        try:
            # Get conversation history if enabled
            history_context = ""
            if include_history:
                history_context = self.memory.get_context(
                    conversation_id, max_messages=5
                )

            # Build prompt with context
            if history_context:
                prompt = f"{history_context}\n\nUser: {message}\nAssistant:"
            else:
                prompt = f"User: {message}\nAssistant:"

            logger.info(f"📤 Sending to Ollama (conversation: {conversation_id})")
            logger.debug(f"Prompt: {prompt[:100]}...")

            # Call Ollama API
            response_text = await self._call_ollama(prompt)

            # Store interaction in memory
            self.memory.add_message(conversation_id, "user", message)
            self.memory.add_message(conversation_id, "assistant", response_text)

            processing_time = (time.time() - start_time) * 1000  # Convert to ms

            logger.info(f"✅ Response generated in {processing_time:.0f}ms")

            return {
                "response": response_text,
                "conversation_id": conversation_id,
                "tokens": 0,  # TODO: Get actual token count from Ollama
                "processing_time_ms": processing_time,
            }

        except Exception as e:
            logger.error(f"❌ Error getting LLM response: {e}")
            raise

    async def _call_ollama(self, prompt: str) -> str:
        """
        Call Ollama API with prompt.

        Args:
            prompt: The prompt to send to LLM

        Returns:
            Response text from LLM
        """
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                payload = {
                    "model": self.model,
                    "prompt": prompt,
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "stream": False,
                }

                async with session.post(
                    f"{self.ollama_url}/api/generate", json=payload
                ) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        raise Exception(f"Ollama API error: {error_text}")

                    data = await resp.json()
                    response = data.get("response", "").strip()

                    if not response:
                        logger.warning("Ollama returned empty response")
                        response = (
                            "I'm having trouble forming a response. Please try again."
                        )

                    return response

        except asyncio.TimeoutError:
            logger.error("Ollama request timed out")
            raise Exception("LLM request timed out. Try again.")
        except Exception as e:
            logger.error(f"Ollama API call failed: {e}")
            raise

    async def stream_response(self, prompt: str):
        """
        Stream LLM response token by token.

        Args:
            prompt: The prompt to send to LLM

        Yields:
            Tokens of response
        """
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                payload = {
                    "model": self.model,
                    "prompt": prompt,
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "stream": True,
                }

                async with session.post(
                    f"{self.ollama_url}/api/generate", json=payload
                ) as resp:
                    if resp.status != 200:
                        raise Exception(f"Ollama API error: {resp.status}")

                    async for line in resp.content:
                        if line:
                            import json

                            data = json.loads(line)
                            token = data.get("response", "")
                            if token:
                                yield token

        except Exception as e:
            logger.error(f"Stream response failed: {e}")
            yield f"Error: {str(e)}"


# Create global instance
llm_service = LLMService()


# ============================================================================
# Module-level functions for convenience
# ============================================================================


async def check_ollama_health() -> bool:
    """Check if Ollama service is healthy"""
    return await llm_service.check_ollama_health()


async def get_response(
    message: str, conversation_id: str = "default", include_history: bool = True
) -> Dict[str, Any]:
    """Get LLM response"""
    return await llm_service.get_response(message, conversation_id, include_history)


def get_llm_service() -> LLMService:
    """Get the singleton LLM service instance"""
    return llm_service
