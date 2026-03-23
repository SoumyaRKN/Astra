"""Avatar Service — upload photo, detect face, generate animated avatar video."""

import time
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class Avatar:
    """Avatar creation and animation from a photo."""

    def __init__(self, storage: str = "storage/avatars"):
        self.storage = Path(storage)
        self.storage.mkdir(parents=True, exist_ok=True)
        self._profile: Optional[dict] = None
        self._device = None
        self._init_device()
        logger.info(f"Avatar service ready — device: {self._device}")

    def _init_device(self):
        try:
            import torch

            self._device = "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            self._device = "cpu"

    def upload(self, data: bytes, filename: str = "avatar.png") -> dict:
        """Upload and process avatar photo. Returns profile info."""
        from PIL import Image
        import io

        start = time.time()
        logger.info(f"Processing avatar upload: {filename}")

        image = Image.open(io.BytesIO(data)).convert("RGB")
        path = self.storage / "profile.png"
        image.save(path)

        face = self._detect_face(image)

        self._profile = {
            "path": str(path),
            "size": list(image.size),
            "face_detected": face is not None,
            "face_region": face,
            "uploaded_at": time.time(),
        }

        elapsed = time.time() - start
        logger.info(f"Avatar processed in {elapsed:.1f}s — face: {face is not None}")
        return self._profile

    def _detect_face(self, image) -> Optional[dict]:
        """Detect face in image using OpenCV."""
        try:
            import cv2
            import numpy as np

            arr = np.array(image)
            gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)

            cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )
            faces = cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
            )

            if len(faces) > 0:
                x, y, w, h = [int(v) for v in faces[0]]
                return {"x": x, "y": y, "width": w, "height": h}
        except ImportError:
            logger.warning("OpenCV not available — face detection skipped")
        return None

    def animate(
        self,
        audio_path: Optional[str] = None,
        text: Optional[str] = None,
        duration: float = 5.0,
        output: Optional[str] = None,
    ) -> str:
        """Animate avatar — basic lip-sync animation. Returns video path."""
        import numpy as np
        from PIL import Image, ImageDraw

        start = time.time()
        logger.info("Animating avatar...")

        if self._profile is None:
            raise ValueError("No avatar uploaded. Upload a photo first.")

        base = Image.open(self._profile["path"]).convert("RGB")
        face = self._profile.get("face_region")

        fps = 24
        total_frames = int(duration * fps)
        frames = []

        for i in range(total_frames):
            frame = base.copy()
            if face:
                draw = ImageDraw.Draw(frame)
                cx = face["x"] + face["width"] // 2
                cy = face["y"] + face["height"]
                # Simple mouth animation
                mouth_open = abs(np.sin(i * 0.5)) * 8
                draw.ellipse(
                    [cx - 10, cy - 5, cx + 10, cy + int(mouth_open)],
                    fill=(180, 80, 80),
                )
            frames.append(np.array(frame))

        if output is None:
            output = str(self.storage / f"anim_{int(time.time())}.mp4")
        Path(output).parent.mkdir(parents=True, exist_ok=True)

        try:
            import imageio

            imageio.mimwrite(output, frames, fps=fps, codec="libx264")
        except ImportError:
            # Fallback — save as GIF
            output = output.replace(".mp4", ".gif")
            pil_frames = [Image.fromarray(f) for f in frames]
            pil_frames[0].save(
                output,
                save_all=True,
                append_images=pil_frames[1:],
                duration=int(1000 / fps),
                loop=0,
            )

        elapsed = time.time() - start
        logger.info(f"Avatar animated in {elapsed:.1f}s: {output}")
        return output

    def get_profile(self) -> Optional[dict]:
        """Get current avatar profile."""
        return self._profile

    def info(self) -> dict:
        return {
            "device": self._device,
            "has_profile": self._profile is not None,
            "profile": self._profile,
        }


# Lazy singleton
_service = None


def get_avatar() -> Avatar:
    global _service
    if _service is None:
        _service = Avatar()
    return _service
