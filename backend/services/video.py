"""Video Generation Service — text-to-video and image-to-video generation."""

import time
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

MODELS = {
    "zeroscope": {
        "name": "cerspense/zeroscope_v2_576w",
        "size": "3GB",
        "speed": "fast",
    },
    "modelscope": {
        "name": "damo-vilab/text-to-video-ms-1.7b",
        "size": "7GB",
        "speed": "medium",
    },
}


class VideoGen:
    """Video generation from text or images."""

    def __init__(self, model: str = "zeroscope", storage: str = "storage/videos"):
        self.model_key = model
        self.model_id = MODELS.get(model, MODELS["zeroscope"])["name"]
        self.storage = Path(storage)
        self.storage.mkdir(parents=True, exist_ok=True)
        self._pipeline = None
        self._device = None
        self._init_device()
        logger.info(f"VideoGen ready — model: {model}, device: {self._device}")

    def _init_device(self):
        try:
            import torch

            self._device = "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            self._device = "cpu"

    def _load_pipeline(self):
        if self._pipeline is not None:
            return self._pipeline

        import torch
        from diffusers import DiffusionPipeline

        logger.info(
            f"Loading video model: {self.model_key} ({MODELS[self.model_key]['size']})..."
        )
        dtype = torch.float16 if self._device == "cuda" else torch.float32
        self._pipeline = DiffusionPipeline.from_pretrained(
            self.model_id, torch_dtype=dtype
        )
        self._pipeline = self._pipeline.to(self._device)
        if self._device == "cuda":
            self._pipeline.enable_attention_slicing()
        logger.info("Video model loaded")
        return self._pipeline

    def generate(
        self,
        prompt: str,
        steps: int = 40,
        frames: int = 24,
        width: int = 576,
        height: int = 320,
        seed: Optional[int] = None,
        output: Optional[str] = None,
    ) -> str:
        """Generate video from text prompt. Returns path to MP4."""
        import torch
        from diffusers.utils import export_to_video

        start = time.time()
        logger.info(f"Generating video: '{prompt[:50]}...' ({frames} frames)")

        pipe = self._load_pipeline()
        gen = torch.Generator(device=self._device).manual_seed(seed) if seed else None

        with torch.no_grad():
            result = pipe(
                prompt=prompt,
                num_inference_steps=steps,
                num_frames=frames,
                height=height,
                width=width,
                generator=gen,
            )

        if output is None:
            output = str(self.storage / f"vid_{int(time.time())}.mp4")
        Path(output).parent.mkdir(parents=True, exist_ok=True)

        export_to_video(result.frames[0], output, fps=8)

        elapsed = time.time() - start
        logger.info(f"Video generated in {elapsed:.1f}s: {output}")
        return output

    def from_image(
        self,
        source: str,
        prompt: str = "",
        steps: int = 40,
        frames: int = 24,
        output: Optional[str] = None,
    ) -> str:
        """Generate video from source image (image-to-video)."""
        import torch
        from PIL import Image
        from diffusers import StableVideoDiffusionPipeline
        from diffusers.utils import export_to_video

        start = time.time()
        logger.info(f"Image-to-video: {source}")

        dtype = torch.float16 if self._device == "cuda" else torch.float32
        pipe = StableVideoDiffusionPipeline.from_pretrained(
            "stabilityai/stable-video-diffusion-img2vid-xt", torch_dtype=dtype
        )
        pipe = pipe.to(self._device)

        src_image = Image.open(source).convert("RGB").resize((1024, 576))

        with torch.no_grad():
            result = pipe(src_image, num_inference_steps=steps, num_frames=frames)

        if output is None:
            output = str(self.storage / f"i2v_{int(time.time())}.mp4")
        Path(output).parent.mkdir(parents=True, exist_ok=True)

        export_to_video(result.frames[0], output, fps=8)

        elapsed = time.time() - start
        logger.info(f"Image-to-video completed in {elapsed:.1f}s: {output}")
        return output

    def info(self) -> dict:
        return {
            "model": self.model_key,
            "device": self._device,
            "loaded": self._pipeline is not None,
            "models": {
                k: {"size": v["size"], "speed": v["speed"]} for k, v in MODELS.items()
            },
        }


# Lazy singleton
_service = None


def get_video_gen() -> VideoGen:
    global _service
    if _service is None:
        _service = VideoGen()
    return _service
