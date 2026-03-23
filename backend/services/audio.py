"""Audio & Soundtrack Service — enhancement, noise reduction, and music generation."""

import time
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class Audio:
    """Audio enhancement and soundtrack/music generation."""

    def __init__(self, storage: str = "storage/audio"):
        self.storage = Path(storage)
        self.storage.mkdir(parents=True, exist_ok=True)
        self._music_pipe = None
        self._device = None
        self._init_device()
        logger.info(f"Audio service ready — device: {self._device}")

    def _init_device(self):
        try:
            import torch

            self._device = "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            self._device = "cpu"

    def enhance(
        self,
        source: str,
        noise_reduce: bool = True,
        normalize: bool = True,
        output: Optional[str] = None,
    ) -> str:
        """Enhance audio — noise reduction and normalization. Returns output path."""
        import numpy as np
        import soundfile as sf

        start = time.time()
        logger.info(f"Enhancing audio: {source}")

        audio, sr = sf.read(source)
        if audio.ndim > 1:
            audio = audio.mean(axis=1)

        if noise_reduce:
            try:
                import noisereduce as nr

                audio = nr.reduce_noise(y=audio, sr=sr, prop_decrease=0.8)
            except ImportError:
                # Simple high-pass filter as fallback
                from scipy.signal import butter, filtfilt

                b, a = butter(4, 80 / (sr / 2), btype="high")
                audio = filtfilt(b, a, audio)

        if normalize:
            peak = np.max(np.abs(audio))
            if peak > 0:
                audio = audio / peak * 0.95

        if output is None:
            output = str(self.storage / f"enhanced_{int(time.time())}.wav")
        Path(output).parent.mkdir(parents=True, exist_ok=True)

        sf.write(output, audio, sr)
        elapsed = time.time() - start
        logger.info(f"Audio enhanced in {elapsed:.1f}s: {output}")
        return output

    def _load_music_pipeline(self):
        if self._music_pipe is not None:
            return self._music_pipe

        import torch
        from transformers import AutoProcessor, MusicgenForConditionalGeneration

        logger.info("Loading MusicGen model...")
        dtype = torch.float16 if self._device == "cuda" else torch.float32
        self._processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
        self._music_pipe = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-small", torch_dtype=dtype
        ).to(self._device)
        logger.info("MusicGen loaded")
        return self._music_pipe

    def generate_music(
        self,
        prompt: str,
        duration: float = 10.0,
        output: Optional[str] = None,
    ) -> str:
        """Generate music/soundtrack from text prompt. Returns path to WAV."""
        import torch
        import soundfile as sf

        start = time.time()
        logger.info(f"Generating music: '{prompt[:50]}...' ({duration}s)")

        model = self._load_music_pipeline()
        inputs = self._processor(text=[prompt], padding=True, return_tensors="pt").to(
            self._device
        )

        tokens_per_second = 50
        max_tokens = int(duration * tokens_per_second)

        with torch.no_grad():
            audio_values = model.generate(**inputs, max_new_tokens=max_tokens)

        audio = audio_values[0, 0].cpu().numpy()
        sample_rate = model.config.audio_encoder.sampling_rate

        if output is None:
            output = str(self.storage / f"music_{int(time.time())}.wav")
        Path(output).parent.mkdir(parents=True, exist_ok=True)

        sf.write(output, audio, sample_rate)
        elapsed = time.time() - start
        logger.info(f"Music generated in {elapsed:.1f}s: {output}")
        return output

    def info(self) -> dict:
        return {
            "device": self._device,
            "music_loaded": self._music_pipe is not None,
            "features": ["enhance", "noise_reduce", "normalize", "generate_music"],
        }


# Lazy singleton
_service = None


def get_audio() -> Audio:
    global _service
    if _service is None:
        _service = Audio()
    return _service
