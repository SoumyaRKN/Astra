"""
Services Module

Centralizes all backend service integrations.
"""

from .llm_service import LLMService, get_llm_service, check_ollama_health
from .stt_service import STTService, get_stt_service
from .voice_clone_service import (
    VoiceCloningService,
    VoiceProfile,
    get_voice_cloning_service,
)
from .tts_service import TTSService, get_tts_service
from .pipecat_orchestrator import VoicePipelineOrchestrator, get_voice_orchestrator
from .avatar_service import AvatarService, get_avatar_service
from .avatar_lipsync_service import (
    LipSyncGenerator,
    get_lipsync_generator,
    VisemeClassifier,
    AudioFeatureExtractor,
)
from .image_generation_service import (
    ImageGenerationService,
    get_image_generation_service,
)
from .video_generation_service import (
    VideoGenerationService,
    get_video_generation_service,
)
from .media_orchestrator import MediaOrchestrator, get_media_orchestrator
from .audio_enhancement_service import (
    AudioEnhancementService,
    get_audio_enhancement_service,
)
from .soundtrack_generation_service import (
    SoundtrackGenerationService,
    get_soundtrack_generation_service,
)

__all__ = [
    # LLM
    "LLMService",
    "get_llm_service",
    "check_ollama_health",
    # STT (Speech-to-Text)
    "STTService",
    "get_stt_service",
    # Voice Cloning
    "VoiceCloningService",
    "VoiceProfile",
    "get_voice_cloning_service",
    # TTS (Text-to-Speech)
    "TTSService",
    "get_tts_service",
    # Voice Orchestrator
    "VoicePipelineOrchestrator",
    "get_voice_orchestrator",
    # Avatar Animation
    "AvatarService",
    "get_avatar_service",
    # Lip-Sync
    "LipSyncGenerator",
    "get_lipsync_generator",
    "VisemeClassifier",
    "AudioFeatureExtractor",
    # Image Generation
    "ImageGenerationService",
    "get_image_generation_service",
    # Video Generation
    "VideoGenerationService",
    "get_video_generation_service",
    # Media Orchestrator
    "MediaOrchestrator",
    "get_media_orchestrator",
    # Audio Enhancement
    "AudioEnhancementService",
    "get_audio_enhancement_service",
    # Soundtrack Generation
    "SoundtrackGenerationService",
    "get_soundtrack_generation_service",
]
