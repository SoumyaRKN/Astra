"""Image Generation Service — uses Stable Diffusion for text-to-image and image-to-image."""

import time
import hashlib
import logging
from pathlib import Path
from typing import Optional, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)


MODELS = {
    "sd-1.5": {
        "name": "runwayml/stable-diffusion-v1-5",
        "size": "4GB",
        "speed": "medium",
    },
    "sd-2.1": {
        "name": "stabilityai/stable-diffusion-2-1",
        "size": "5GB",
        "speed": "slow",
    },
    "sdxl": {
        "name": "stabilityai/stable-diffusion-xl-base-1.0",
        "size": "7GB",
        "speed": "slow",
    },
    "sdxl-turbo": {"name": "stabilityai/sdxl-turbo", "size": "7GB", "speed": "fast"},
}


class ImageGen:
    """Image generation service using Stable Diffusion."""

    def __init__(self, model: str = "sd-1.5", storage: str = "storage/images"):
        self.model_key = model
        self.model_id = MODELS.get(model, MODELS["sd-1.5"])["name"]
        self.storage = Path(storage)
        self.storage.mkdir(parents=True, exist_ok=True)
        self._pipeline = None
        self._device = None
        self._init_device()
        logger.info(f"ImageGen ready — model: {model}, device: {self._device}")

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
        from diffusers import StableDiffusionPipeline, EulerDiscreteScheduler

        logger.info(f"Loading {self.model_key} ({MODELS[self.model_key]['size']})...")
        dtype = torch.float16 if self._device == "cuda" else torch.float32
        self._pipeline = StableDiffusionPipeline.from_pretrained(
            self.model_id, torch_dtype=dtype
        )
        self._pipeline = self._pipeline.to(self._device)
        if self._device == "cuda":
            self._pipeline.enable_attention_slicing()
        self._pipeline.scheduler = EulerDiscreteScheduler.from_config(
            self._pipeline.scheduler.config
        )
        logger.info("Image model loaded")
        return self._pipeline

    def generate(
        self,
        prompt: str,
        negative: str = "blurry, low quality, distorted",
        steps: int = 50,
        guidance: float = 7.5,
        width: int = 512,
        height: int = 512,
        seed: Optional[int] = None,
        output: Optional[str] = None,
    ) -> str:
        """Generate image from text prompt. Returns path to saved image."""
        import torch

        start = time.time()
        logger.info(
            f"Generating image: '{prompt[:60]}...' ({width}x{height}, {steps} steps)"
        )

        pipe = self._load_pipeline()
        gen = torch.Generator(device=self._device).manual_seed(seed) if seed else None

        with torch.no_grad():
            result = pipe(
                prompt=prompt,
                negative_prompt=negative,
                num_inference_steps=steps,
                guidance_scale=guidance,
                height=height,
                width=width,
                generator=gen,
            )
        image = result.images[0]

        if output is None:
            key = hashlib.md5(f"{prompt}_{seed}".encode()).hexdigest()[:10]
            output = str(self.storage / f"img_{key}_{int(time.time())}.png")

        Path(output).parent.mkdir(parents=True, exist_ok=True)
        image.save(output)

        elapsed = time.time() - start
        logger.info(f"Image generated in {elapsed:.1f}s: {output}")
        return output

    def from_image(
        self,
        source: str,
        prompt: str,
        strength: float = 0.75,
        steps: int = 50,
        guidance: float = 7.5,
        output: Optional[str] = None,
    ) -> str:
        """Generate image from source image + prompt (img2img)."""
        import torch
        from diffusers import StableDiffusionImg2ImgPipeline
        from PIL import Image

        start = time.time()
        logger.info(f"Image-to-image: '{prompt[:40]}' from {source}")

        dtype = torch.float16 if self._device == "cuda" else torch.float32
        pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            self.model_id, torch_dtype=dtype
        )
        pipe = pipe.to(self._device)

        src_image = Image.open(source).convert("RGB").resize((512, 512))

        with torch.no_grad():
            result = pipe(
                prompt=prompt,
                image=src_image,
                strength=strength,
                guidance_scale=guidance,
                num_inference_steps=steps,
            )
        image = result.images[0]

        if output is None:
            output = str(self.storage / f"i2i_{int(time.time())}.png")
        Path(output).parent.mkdir(parents=True, exist_ok=True)
        image.save(output)

        elapsed = time.time() - start
        logger.info(f"img2img completed in {elapsed:.1f}s: {output}")
        return output

    def from_trained(
        self,
        prompt: str,
        lora_path: str,
        steps: int = 50,
        guidance: float = 7.5,
        output: Optional[str] = None,
    ) -> str:
        """Generate image using a fine-tuned LoRA model from training."""
        import torch

        start = time.time()
        logger.info(f"Generating with LoRA: '{prompt[:40]}' using {lora_path}")

        pipe = self._load_pipeline()
        pipe.load_lora_weights(lora_path)

        with torch.no_grad():
            result = pipe(
                prompt=prompt, num_inference_steps=steps, guidance_scale=guidance
            )
        image = result.images[0]

        if output is None:
            output = str(self.storage / f"lora_{int(time.time())}.png")
        Path(output).parent.mkdir(parents=True, exist_ok=True)
        image.save(output)

        # Unload LoRA to free memory
        pipe.unload_lora_weights()

        elapsed = time.time() - start
        logger.info(f"LoRA generation in {elapsed:.1f}s: {output}")
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


def get_image_gen() -> ImageGen:
    global _service
    if _service is None:
        _service = ImageGen()
    return _service
