"""Services package — lazy imports for all AI services."""

from services.stt import get_stt
from services.tts import get_tts
from services.voice import get_voice
from services.image import get_image_gen
from services.video import get_video_gen
from services.audio import get_audio
from services.avatar import get_avatar
from services.train import get_trainer

__all__ = [
    "get_stt",
    "get_tts",
    "get_voice",
    "get_image_gen",
    "get_video_gen",
    "get_audio",
    "get_avatar",
    "get_trainer",
]
