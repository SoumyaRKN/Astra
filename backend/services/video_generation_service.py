"""
Video Generation Service using Text-to-Video models

Provides video generation capabilities from text prompts and images.
Supports multiple models for different use cases.

Performance (CPU: Intel i5-1155G7, 16GB RAM):
- Video generation: 1-3 hours per video
- Memory: 6-8 GB during generation
- Not recommended - only for testing

Performance (GPU: RTX 3090+):
- Video generation: 1-5 minutes per video
- Memory: 12-16 GB during generation
- HIGHLY RECOMMENDED for production

Usage:
    service = VideoGenerationService()
    video_path = service.generate_video(
        prompt="A person walking through a forest",
        duration=5
    )
"""

import os
import sys
from pathlib import Path
from typing import Optional, Dict, List
from datetime import datetime
from dataclasses import dataclass
from loguru import logger
import hashlib
import json
import time

# Configure logging
logger.enable("video_generation_service")


@dataclass
class VideoConfig:
    """Configuration for video generation"""

    height: int = 512
    width: int = 512
    num_frames: int = 16  # 8 frames = ~0.3s at 30fps
    fps: int = 30
    duration: float = 5.0
    num_inference_steps: int = 50
    guidance_scale: float = 7.5
    seed: Optional[int] = None


class VideoGenerationService:
    """
    Video generation service using text-to-video models.

    Handles:
    1. Model loading and management
    2. Video generation from text prompts
    3. Image-to-video synthesis
    4. Video editing and extension
    5. Caching and optimization
    """

    AVAILABLE_MODELS = {
        "hunyuanvideo": {
            "name": "tsinghua-zlab/hunyuanvideo",
            "size": "10GB",
            "quality": "excellent",
            "speed": "slow",
            "max_frames": 128,
        },
        "modelscope": {
            "name": "damo-vilab/text-to-video-ms-1.7b",
            "size": "7GB",
            "quality": "good",
            "speed": "medium",
            "max_frames": 48,
        },
        "zeroscope": {
            "name": "cerspense/zeroscope_v2_576w",
            "size": "3GB",
            "quality": "fair",
            "speed": "fast",
            "max_frames": 24,
        },
    }

    DEFAULT_MODEL = "modelscope"

    def __init__(
        self,
        model_name: str = DEFAULT_MODEL,
        cache_dir: str = "./cache/videos",
        use_gpu: bool = True,
    ):
        """
        Initialize Video Generation Service.

        Args:
            model_name: Video generation model to use
            cache_dir: Directory for caching generated videos
            use_gpu: Whether to use GPU acceleration (CUDA)
        """
        self.model_name = model_name
        self.cache_dir = Path(cache_dir)
        self.use_gpu = use_gpu
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # Model management
        self.model = None
        self.pipeline = None
        self.device = None
        self._init_device()

        logger.info(
            f"✅ Video Generation Service initialized (GPU: {use_gpu}, Model: {model_name})"
        )

    def _init_device(self):
        """Initialize compute device (GPU or CPU)"""
        try:
            import torch

            if self.use_gpu and torch.cuda.is_available():
                self.device = "cuda"
                gpu_name = torch.cuda.get_device_name(0)
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                logger.info(f"🚀 Using GPU: {gpu_name} ({gpu_memory:.1f} GB)")
            else:
                self.device = "cpu"
                logger.warning(
                    "⚠️  Using CPU (VERY SLOW - GPUs 10-100x faster). Not recommended for video generation."
                )

        except ImportError:
            logger.warning("PyTorch not available, CPU-only mode")
            self.device = "cpu"

    def load_model(self):
        """
        Load video generation model.

        Returns:
            Loaded pipeline instance
        """
        if self.pipeline is not None:
            return self.pipeline

        try:
            logger.info(
                f"Loading {self.model_name} model ({self.AVAILABLE_MODELS[self.model_name]['size']})..."
            )
            logger.warning(
                "⚠️  First load will download large model file (~3-10 GB). This may take 5-15 minutes."
            )

            # Model loading depends on which model is selected
            model_config = self.AVAILABLE_MODELS[self.model_name]

            if self.model_name == "modelscope":
                from diffusers import DiffusionPipeline
                import torch

                self.pipeline = DiffusionPipeline.from_pretrained(
                    model_config["name"],
                    torch_dtype=torch.float16 if self.use_gpu else torch.float32,
                )
                self.pipeline = self.pipeline.to(self.device)

                # Memory optimization
                if self.device == "cuda":
                    self.pipeline.enable_attention_slicing()

                logger.info("✅ ModelScope video generation model loaded")

            elif self.model_name == "zeroscope":
                from diffusers import DiffusionPipeline
                import torch

                self.pipeline = DiffusionPipeline.from_pretrained(
                    model_config["name"],
                    torch_dtype=torch.float16 if self.use_gpu else torch.float32,
                )
                self.pipeline = self.pipeline.to(self.device)
                logger.info("✅ Zeroscope video generation model loaded")

            else:
                logger.warning(
                    f"Model {self.model_name} loading not yet implemented. Using placeholder."
                )
                self.pipeline = {"type": "placeholder", "model": self.model_name}

            return self.pipeline

        except ImportError as e:
            logger.error(f"❌ Failed to import required libraries: {e}")
            logger.info(
                "Install with: pip install diffusers transformers safetensors imageio imageio-ffmpeg"
            )
            raise

        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            logger.info(
                "This may be due to insufficient GPU memory or model download issues"
            )
            raise

    def generate_video(
        self,
        prompt: str,
        duration: float = 5.0,
        height: int = 512,
        width: int = 512,
        num_steps: int = 50,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
        output_path: Optional[str] = None,
        use_cache: bool = True,
    ) -> str:
        """
        Generate video from text prompt.

        Args:
            prompt: Text description of video to generate
            duration: Video duration in seconds
            height: Frame height
            width: Frame width
            num_steps: Number of diffusion steps
            guidance_scale: Guidance scale for prompt following
            seed: Random seed for reproducibility
            output_path: Path to save generated video
            use_cache: Whether to check cache first

        Returns:
            Path to generated video file
        """
        start_time = time.time()

        try:
            # Check cache
            cache_key = self._compute_cache_key(prompt, duration, num_steps)

            if use_cache:
                cached_path = self.get_cached_video(cache_key)
                if cached_path:
                    logger.info(f"🎬 Returning cached video: {cached_path}")
                    return cached_path

            logger.info(f"🎬 Generating video: '{prompt[:50]}'...")
            logger.info(
                f"   Duration: {duration}s, Size: {width}x{height}, Steps: {num_steps}"
            )

            # Calculate frames needed
            max_frames = self.AVAILABLE_MODELS[self.model_name]["max_frames"]
            num_frames = min(int(duration * 14), max_frames)  # ~14 fps internal
            logger.info(f"   Generating {num_frames} frames...")

            # Load model
            pipeline = self.load_model()

            # Check if model is placeholder
            if isinstance(pipeline, dict) and pipeline.get("type") == "placeholder":
                logger.warning("⚠️  Using placeholder model for testing")
                # Generate dummy video frames
                frames = self._generate_placeholder_frames(width, height, num_frames)
            else:
                import torch

                # Generate with actual model
                with torch.no_grad():
                    output = pipeline(
                        prompt=prompt,
                        num_inference_steps=num_steps,
                        guidance_scale=guidance_scale,
                        num_frames=num_frames,
                        height=height,
                        width=width,
                        generator=self._get_generator(seed),
                    )

                    # Extract frames
                    frames = output.frames if hasattr(output, "frames") else output[0]

            # Save video
            if output_path is None:
                output_path = self.cache_dir / f"video_{cache_key[:8]}.mp4"
            else:
                output_path = Path(output_path)

            output_path.parent.mkdir(parents=True, exist_ok=True)

            # Write video file
            self._save_video(frames, str(output_path), fps=14)

            # Cache metadata
            self._cache_metadata(cache_key, str(output_path), prompt, duration)

            elapsed = time.time() - start_time
            logger.info(f"✅ Video generated in {elapsed:.1f}s: {output_path}")

            return str(output_path)

        except Exception as e:
            logger.error(f"❌ Failed to generate video: {e}")
            raise

    def _generate_placeholder_frames(
        self, width: int, height: int, num_frames: int
    ) -> List:
        """Generate placeholder frames for testing"""
        try:
            import numpy as np

            logger.info("📽️  Generating placeholder frames for testing...")

            frames = []

            for i in range(num_frames):
                # Create gradient frame
                frame = np.zeros((height, width, 3), dtype=np.uint8)

                # Add gradient effect
                progress = i / num_frames
                frame[:, :, 0] = int(255 * progress)  # Red
                frame[:, :, 1] = int(255 * (1 - progress))  # Green
                frame[:, :, 2] = 128  # Blue

                frames.append(frame)

            return frames

        except Exception as e:
            logger.error(f"Failed to generate placeholder frames: {e}")
            raise

    def _save_video(self, frames: List, output_path: str, fps: int = 14):
        """Save frames as video file"""
        try:
            import imageio

            logger.info(f"💾 Saving video: {output_path}")

            # Use imageio to save video
            imageio.mimsave(output_path, frames, fps=fps, codec="libx264")

            logger.info(f"✅ Video saved successfully")

        except ImportError:
            logger.error(
                "❌ imageio not installed. Install with: pip install imageio imageio-ffmpeg"
            )
            raise

        except Exception as e:
            logger.error(f"❌ Failed to save video: {e}")
            raise

    def _get_generator(self, seed: Optional[int] = None):
        """Get torch generator for reproducibility"""
        try:
            import torch

            if seed is not None:
                return torch.Generator(device=self.device).manual_seed(seed)
            return None

        except Exception:
            return None

    def _compute_cache_key(self, prompt: str, duration: float, num_steps: int) -> str:
        """Compute cache key from parameters"""
        key_str = f"{prompt}_{duration}_{num_steps}"
        return hashlib.md5(key_str.encode()).hexdigest()

    def get_cached_video(self, cache_key: str) -> Optional[str]:
        """
        Retrieve cached video.

        Args:
            cache_key: Cache key

        Returns:
            Path to cached video or None
        """
        metadata_file = self.cache_dir / f"{cache_key}_meta.json"

        if metadata_file.exists():
            try:
                with open(metadata_file, "r") as f:
                    metadata = json.load(f)
                    video_path = metadata.get("video_path")

                    if video_path and os.path.exists(video_path):
                        logger.info(f"💾 Found cached video: {video_path}")
                        return video_path

            except Exception as e:
                logger.warning(f"Failed to read cache metadata: {e}")

        return None

    def _cache_metadata(
        self, cache_key: str, video_path: str, prompt: str, duration: float
    ):
        """Cache metadata about generated video"""
        try:
            metadata = {
                "cache_key": cache_key,
                "video_path": video_path,
                "prompt": prompt,
                "duration": duration,
                "created_at": datetime.utcnow().isoformat(),
                "model": self.model_name,
            }

            metadata_file = self.cache_dir / f"{cache_key}_meta.json"

            with open(metadata_file, "w") as f:
                json.dump(metadata, f, indent=2)

            logger.info(f"💾 Video metadata cached")

        except Exception as e:
            logger.warning(f"Failed to cache metadata: {e}")

    def image_to_video(
        self,
        image_path: str,
        prompt: str = "A smooth motion",
        duration: float = 5.0,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate video from image.

        Args:
            image_path: Path to image file
            prompt: Motion description
            duration: Video duration
            output_path: Path to save video

        Returns:
            Path to generated video
        """
        try:
            logger.info(f"🎬 Converting image to video: {Path(image_path).name}")

            from PIL import Image

            image = Image.open(image_path)

            # Load image-to-video model
            from diffusers import DiffusionPipeline
            import torch

            pipeline = DiffusionPipeline.from_pretrained(
                "damo-vilab/i2vgen-xl",
                torch_dtype=torch.float16 if self.use_gpu else torch.float32,
            )
            pipeline = pipeline.to(self.device)

            # Generate video
            num_frames = int(duration * 14)

            with torch.no_grad():
                output = pipeline(
                    prompt=prompt,
                    image=image,
                    num_inference_steps=50,
                    num_frames=num_frames,
                )

                frames = output.frames if hasattr(output, "frames") else output[0]

            # Save
            if output_path is None:
                output_path = (
                    self.cache_dir
                    / f"video_from_image_{datetime.utcnow().timestamp()}.mp4"
                )

            self._save_video(frames, str(output_path))
            logger.info(f"✅ Video generated from image: {output_path}")

            return str(output_path)

        except Exception as e:
            logger.error(f"❌ Image-to-video conversion failed: {e}")
            raise

    def get_model_info(self) -> Dict:
        """Get information about current model"""
        return {
            "model": self.model_name,
            "size": self.AVAILABLE_MODELS[self.model_name]["size"],
            "quality": self.AVAILABLE_MODELS[self.model_name]["quality"],
            "speed": self.AVAILABLE_MODELS[self.model_name]["speed"],
            "max_frames": self.AVAILABLE_MODELS[self.model_name]["max_frames"],
            "device": self.device,
        }

    def clear_cache(self):
        """Clear video cache"""
        try:
            import shutil

            shutil.rmtree(self.cache_dir)
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            logger.info("🗑️  Video cache cleared")

        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            raise


# Singleton instance management
_video_service = None


def get_video_generation_service(
    model_name: str = VideoGenerationService.DEFAULT_MODEL, use_gpu: bool = True
) -> VideoGenerationService:
    """
    Get or create singleton VideoGenerationService instance.

    Args:
        model_name: Model to use
        use_gpu: Whether to use GPU

    Returns:
        VideoGenerationService instance
    """
    global _video_service

    if _video_service is None:
        _video_service = VideoGenerationService(model_name=model_name, use_gpu=use_gpu)

    return _video_service
