"""LLM Service — communicates with Ollama for chat completions."""

import time
import logging
import aiohttp

from config import settings
from memory import Memory

logger = logging.getLogger(__name__)


class LLM:
    """Chat service powered by Ollama."""

    def __init__(self):
        self.url = settings.OLLAMA_URL
        self.model = settings.OLLAMA_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.top_p = settings.LLM_TOP_P
        self.timeout = aiohttp.ClientTimeout(total=settings.OLLAMA_TIMEOUT)
        self.memory = Memory()
        logger.info(f"LLM ready — model: {self.model}, url: {self.url}")

    async def health(self) -> bool:
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as s:
                async with s.get(f"{self.url}/api/tags") as r:
                    return r.status == 200
        except Exception as e:
            logger.warning(f"Ollama unreachable: {e}")
            return False

    async def chat(
        self, message: str, session: str = "default", use_history: bool = True
    ) -> dict:
        start = time.time()

        context = self.memory.context(session) if use_history else ""
        prompt = (
            f"{context}\n\nUser: {message}\nAssistant:"
            if context
            else f"User: {message}\nAssistant:"
        )

        logger.info(f"[{session}] Sending to Ollama: {message[:80]}...")

        text = await self._generate(prompt)

        self.memory.add(session, "user", message)
        self.memory.add(session, "assistant", text)

        elapsed = (time.time() - start) * 1000
        logger.info(f"[{session}] Response in {elapsed:.0f}ms: {text[:80]}...")

        return {
            "response": text,
            "session": session,
            "time_ms": elapsed,
        }

    async def _generate(self, prompt: str) -> str:
        async with aiohttp.ClientSession(timeout=self.timeout) as s:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "stream": False,
            }
            async with s.post(f"{self.url}/api/generate", json=payload) as r:
                if r.status != 200:
                    err = await r.text()
                    raise RuntimeError(f"Ollama error ({r.status}): {err}")
                data = await r.json()
                text = data.get("response", "").strip()
                if not text:
                    text = "I couldn't generate a response. Please try again."
                return text

    async def stream(self, prompt: str):
        async with aiohttp.ClientSession(timeout=self.timeout) as s:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "stream": True,
            }
            async with s.post(f"{self.url}/api/generate", json=payload) as r:
                if r.status != 200:
                    raise RuntimeError(f"Ollama stream error: {r.status}")
                import json as _json

                async for line in r.content:
                    if line:
                        data = _json.loads(line)
                        token = data.get("response", "")
                        if token:
                            yield token

    def get_history(self, session: str = "default") -> list:
        return self.memory.history(session)

    def clear_history(self, session: str = "default"):
        self.memory.clear(session)

    def get_sessions(self) -> list:
        return self.memory.sessions()


# Singleton
llm = LLM()
