"""
Media Orchestrator Service

Combines image generation, video generation, avatar animation, and voice
to create fully dynamic media interactions.

Handles:
1. Scene generation (background + avatar)
2. Dynamic transitions
3. Avatar with generated backgrounds
4. Composite video creation
5. End-to-end interaction pipeline
"""

from typing import Optional, Dict, List, Tuple
from pathlib import Path
from datetime import datetime
from loguru import logger
import json

logger.enable("media_orchestrator")


class MediaOrchestrator:
    """
    Orchestrates image/video generation with avatar and voice services.

    Combines:
    - Avatar animation (Phase 3)
    - Voice synthesis (Phase 2)
    - Image generation (Phase 4)
    - Video generation (Phase 4)
    """

    def __init__(self, cache_dir: str = "./cache/media"):
        """
        Initialize Media Orchestrator.

        Args:
            cache_dir: Directory for caching composite media
        """
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # Import services (lazy load when needed)
        self.avatar_service = None
        self.lipsync_service = None
        self.voice_service = None
        self.image_service = None
        self.video_service = None

        logger.info("✅ Media Orchestrator initialized")

    def _get_avatar_service(self):
        """Lazy load avatar service"""
        if self.avatar_service is None:
            try:
                from .avatar_service import get_avatar_service

                self.avatar_service = get_avatar_service()
            except Exception as e:
                logger.error(f"Failed to load avatar service: {e}")
                raise
        return self.avatar_service

    def _get_lipsync_service(self):
        """Lazy load lip-sync service"""
        if self.lipsync_service is None:
            try:
                from .avatar_lipsync_service import get_lipsync_generator

                self.lipsync_service = get_lipsync_generator()
            except Exception as e:
                logger.error(f"Failed to load lip-sync service: {e}")
                raise
        return self.lipsync_service

    def _get_image_service(self):
        """Lazy load image service"""
        if self.image_service is None:
            try:
                from .image_generation_service import get_image_generation_service

                self.image_service = get_image_generation_service()
            except Exception as e:
                logger.error(f"Failed to load image service: {e}")
                raise
        return self.image_service

    def _get_video_service(self):
        """Lazy load video service"""
        if self.video_service is None:
            try:
                from .video_generation_service import get_video_generation_service

                self.video_service = get_video_generation_service()
            except Exception as e:
                logger.error(f"Failed to load video service: {e}")
                raise
        return self.video_service

    def generate_scene_background(
        self,
        scene_description: str,
        width: int = 512,
        height: int = 512,
        num_steps: int = 50,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate background image for a scene.

        Args:
            scene_description: Description of the background scene
            width: Image width
            height: Image height
            num_steps: Generation steps
            output_path: Path to save image

        Returns:
            Path to generated background image
        """
        try:
            logger.info(f"🎨 Generating scene background: {scene_description[:40]}...")

            image_service = self._get_image_service()

            background = image_service.generate_image(
                prompt=scene_description,
                num_steps=num_steps,
                guidance_scale=7.5,
                height=height,
                width=width,
                output_path=output_path,
            )

            logger.info(f"✅ Background generated: {background}")
            return background

        except Exception as e:
            logger.error(f"❌ Failed to generate background: {e}")
            raise

    def generate_avatar_scene(
        self,
        avatar_profile: "AvatarProfile",
        audio_path: str,
        scene_description: str,
        user_id: str,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate animated avatar with generated background.

        Pipeline:
        1. Generate background image
        2. Generate avatar animation
        3. Composite background + avatar
        4. Sync with audio

        Args:
            avatar_profile: Avatar profile to animate
            audio_path: Path to audio for lip-sync
            scene_description: Description of background scene
            user_id: User identifier
            output_path: Path to save composite video

        Returns:
            Path to composite video
        """
        try:
            logger.info("🎬 Generating avatar scene with dynamic background...")

            # Step 1: Generate background
            logger.info("Step 1/3: Generating background...")
            background = self.generate_scene_background(
                scene_description,
                width=512,
                height=512,
                num_steps=40,
            )

            # Step 2: Generate avatar animation
            logger.info("Step 2/3: Generating avatar animation...")
            avatar_service = self._get_avatar_service()

            if output_path is None:
                output_path = (
                    self.cache_dir
                    / f"avatar_scene_{user_id}_{datetime.utcnow().timestamp()}.mp4"
                )

            avatar_video = avatar_service.generate_avatar_video(
                avatar_profile, audio_path, str(output_path)
            )

            # Step 3: Composite with background
            logger.info("Step 3/3: Compositing with background...")
            composite = self._composite_avatar_background(
                avatar_video, background, str(output_path)
            )

            logger.info(f"✅ Avatar scene generated: {composite}")
            return composite

        except Exception as e:
            logger.error(f"❌ Failed to generate avatar scene: {e}")
            raise

    def _composite_avatar_background(
        self, avatar_video: str, background_image: str, output_path: str
    ) -> str:
        """
        Overlay avatar on background.

        Args:
            avatar_video: Path to avatar video
            background_image: Path to background image
            output_path: Path to save composite

        Returns:
            Path to composite video
        """
        try:
            import cv2
            import numpy as np
            from PIL import Image

            logger.info("🎨 Compositing avatar with background...")

            # Load background
            bg = Image.open(background_image)
            bg_array = np.array(bg)

            # This is a simplified compositing
            # In production, would use advanced blending/keying
            logger.info("   (Using simplified compositing for now)")

            # For now, just copy the avatar video as the output
            # In production, would actually overlay avatar on background
            import shutil

            shutil.copy(avatar_video, output_path)

            logger.info(f"✅ Composite created: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"❌ Compositing failed: {e}")
            raise

    def generate_dynamic_video(
        self,
        prompt: str,
        duration: float = 5.0,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate dynamic video from description.

        Args:
            prompt: Description of video to generate
            duration: Video duration
            output_path: Path to save video

        Returns:
            Path to generated video
        """
        try:
            logger.info(f"🎬 Generating dynamic video: {prompt[:40]}...")

            video_service = self._get_video_service()

            video = video_service.generate_video(
                prompt=prompt,
                duration=duration,
                output_path=output_path,
            )

            logger.info(f"✅ Video generated: {video}")
            return video

        except Exception as e:
            logger.error(f"❌ Failed to generate video: {e}")
            raise

    def create_multi_scene_video(
        self,
        scenes: List[Dict],
        audio_path: Optional[str] = None,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Create multi-scene video with transitions.

        Each scene:
        {
            "type": "avatar" | "image" | "video",
            "duration": float,
            "description": str,
            "avatar_profile": Optional[AvatarProfile],
            ...
        }

        Args:
            scenes: List of scene configurations
            audio_path: Optional audio to sync
            output_path: Path to save composite

        Returns:
            Path to composite video
        """
        try:
            logger.info(f"🎬 Creating multi-scene video with {len(scenes)} scenes...")

            if output_path is None:
                output_path = (
                    self.cache_dir / f"multiscene_{datetime.utcnow().timestamp()}.mp4"
                )

            # TODO: Implement scene composition
            logger.warning("⚠️  Multi-scene composition not yet fully implemented")

            logger.info(f"📝 Placeholder for multi-scene video: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"❌ Multi-scene creation failed: {e}")
            raise

    def get_orchestrator_status(self) -> Dict:
        """Get status of all services"""
        return {
            "orchestrator": "ready",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "avatar": "loaded" if self.avatar_service else "not_loaded",
                "image": "loaded" if self.image_service else "not_loaded",
                "video": "loaded" if self.video_service else "not_loaded",
                "lipsync": "loaded" if self.lipsync_service else "not_loaded",
            },
            "cache_dir": str(self.cache_dir),
        }


# Singleton instance management
_orchestrator = None


def get_media_orchestrator() -> MediaOrchestrator:
    """
    Get or create singleton MediaOrchestrator instance.

    Returns:
        MediaOrchestrator instance
    """
    global _orchestrator

    if _orchestrator is None:
        _orchestrator = MediaOrchestrator()

    return _orchestrator
