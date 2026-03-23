"""
FastAPI Application Entry Point

Main application setup and routing for Personal AI Assistant backend.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, File, Query, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from pathlib import Path
import io

from config import settings
from services import (
    llm_service,
    get_voice_orchestrator,
    get_voice_cloning_service,
    get_avatar_service,
    get_lipsync_generator,
    get_image_generation_service,
    get_video_generation_service,
    get_media_orchestrator,
    get_audio_enhancement_service,
    get_soundtrack_generation_service,
)
from db.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ============================================================================
# Startup/Shutdown Events
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage app startup and shutdown events.
    """
    # Startup
    logger.info("🚀 Starting Personal AI Assistant Backend")
    logger.info(f"📚 LLM Model: {settings.OLLAMA_MODEL}")
    logger.info(f"🔌 Ollama Base URL: {settings.OLLAMA_BASE_URL}")

    # Initialize database
    try:
        init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")

    # Test Ollama connection
    try:
        health = await llm_service.check_ollama_health()
        if health:
            logger.info("✅ Ollama service is healthy")
        else:
            logger.warning("⚠️  Ollama service may not be responding correctly")
    except Exception as e:
        logger.warning(f"⚠️  Could not reach Ollama: {e}")

    yield

    # Shutdown
    logger.info("👋 Shutting down Personal AI Assistant Backend")


# ============================================================================
# Create FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A fully self-hosted personal AI assistant backend",
    lifespan=lifespan,
)


# ============================================================================
# Request/Response Models
# ============================================================================


class ChatRequest(BaseModel):
    """Request model for /chat endpoint"""

    message: str
    conversation_id: str = None
    include_history: bool = True


class ChatResponse(BaseModel):
    """Response model for /chat endpoint"""

    conversation_id: str
    user_message: str
    assistant_response: str
    tokens_used: int = 0
    processing_time_ms: float = 0


class HealthResponse(BaseModel):
    """Response model for /health endpoint"""

    status: str
    ollama_connected: bool
    database_connected: bool
    model: str


# ============================================================================
# Phase 2: Voice Models
# ============================================================================


class VoiceUploadResponse(BaseModel):
    """Response for voice sample upload"""

    sample_id: int
    user_id: str
    duration: float
    status: str


class VoiceTrainRequest(BaseModel):
    """Request to train voice cloning"""

    user_id: str
    sample_ids: list = None
    voice_name: str = "default"


class VoiceTrainResponse(BaseModel):
    """Response for voice training"""

    status: str
    voice_profile_id: int = None
    message: str


class VoiceSynthesisRequest(BaseModel):
    """Request to synthesize speech"""

    text: str
    voice_profile_id: int = None
    language: str = "en"


class VoiceProfileResponse(BaseModel):
    """Voice profile information"""

    id: int
    voice_name: str
    num_samples: int
    trained_at: str
    sample_rate: int


# ============================================================================
# Phase 3: Avatar Models
# ============================================================================


class AvatarUploadResponse(BaseModel):
    """Response for avatar photo upload"""

    photo_id: int
    user_id: str
    file_path: str
    status: str


class AvatarCreateRequest(BaseModel):
    """Request to create avatar profile"""

    user_id: str
    avatar_name: str = "default"
    photo_ids: list = None


class AvatarCreateResponse(BaseModel):
    """Response for avatar creation"""

    avatar_id: int
    user_id: str
    avatar_name: str
    status: str
    message: str


class AvatarGenerateVideoRequest(BaseModel):
    """Request to generate avatar video"""

    avatar_id: int
    audio_path: str
    user_id: str
    add_lipsync: bool = True


class AvatarGenerateVideoResponse(BaseModel):
    """Response for avatar video generation"""

    video_id: int
    avatar_id: int
    video_path: str
    duration: float
    status: str
    generation_time: float


class AvatarProfileResponse(BaseModel):
    """Avatar profile information"""

    id: int
    user_id: str
    avatar_name: str
    photo_count: int
    created_at: str
    video_count: int = 0


# ============================================================================
# Phase 4: Image & Video Generation Models
# ============================================================================


class ImageGenerationRequest(BaseModel):
    """Request to generate image"""

    prompt: str
    user_id: str
    num_steps: int = 50
    guidance_scale: float = 7.5
    height: int = 512
    width: int = 512
    seed: int = None


class ImageGenerationResponse(BaseModel):
    """Response for image generation"""

    image_id: int
    user_id: str
    prompt: str
    image_path: str
    status: str
    generation_time: float


class VideoGenerationRequest(BaseModel):
    """Request to generate video"""

    prompt: str
    user_id: str
    duration: float = 5.0
    height: int = 512
    width: int = 512
    num_steps: int = 50
    seed: int = None


class VideoGenerationResponse(BaseModel):
    """Response for video generation"""

    video_id: int
    user_id: str
    prompt: str
    video_path: str
    duration: float
    status: str
    generation_time: float


class MediaModelInfoResponse(BaseModel):
    """Information about available media models"""

    image_models: dict
    video_models: dict
    gpu_available: bool
    device: str


# ============================================================================
# Phase 5: Audio Enhancement & Soundtrack Generation Models
# ============================================================================


class AudioEnhancementRequest(BaseModel):
    """Request to enhance audio"""

    audio_path: str
    user_id: str
    reduce_noise: bool = True
    normalize: bool = True
    equalize: bool = False


class AudioEnhancementResponse(BaseModel):
    """Response for audio enhancement"""

    audio_id: int
    user_id: str
    original_path: str
    enhanced_path: str
    status: str
    processing_time: float


class SoundtrackGenerationRequest(BaseModel):
    """Request to generate soundtrack"""

    description: str
    user_id: str
    duration: float = 30.0
    mood: str = "calm"
    bpm: int = None


class SoundtrackGenerationResponse(BaseModel):
    """Response for soundtrack generation"""

    soundtrack_id: int
    user_id: str
    description: str
    soundtrack_path: str
    duration: float
    mood: str
    status: str
    generation_time: float


# ============================================================================
# API Endpoints
# ============================================================================


@app.get("/", tags=["Info"])
async def root():
    """Root endpoint - welcome message"""
    return {
        "message": "Welcome to Personal AI Assistant Backend",
        "version": settings.APP_VERSION,
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "docs": "/docs",
            "openapi": "/openapi.json",
        },
    }


@app.get("/health", tags=["Health"], response_model=HealthResponse)
async def health_check():
    """
    Check backend health and service status.

    Returns:
        - status: "healthy" or "degraded"
        - ollama_connected: Ollama service availability
        - database_connected: Database availability
        - model: Currently loaded LLM model
    """
    try:
        ollama_health = await llm_service.check_ollama_health()
        db_health = await check_database_health()

        status = "healthy" if (ollama_health and db_health) else "degraded"

        return HealthResponse(
            status=status,
            ollama_connected=ollama_health,
            database_connected=db_health,
            model=settings.OLLAMA_MODEL,
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="error",
            ollama_connected=False,
            database_connected=False,
            model=settings.OLLAMA_MODEL,
        )


@app.post("/chat", tags=["Chat"], response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - send message and get response from LLM.

    Args:
        request: ChatRequest containing user message

    Returns:
        ChatResponse with assistant's reply

    Example:
        POST /chat
        {
            "message": "Hello, how are you?",
            "conversation_id": "conv_123"
        }
    """
    if not request.message or request.message.strip() == "":
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        logger.info(f"📝 Received message: {request.message[:50]}...")

        # Get LLM response
        response = await llm_service.get_response(
            message=request.message,
            conversation_id=request.conversation_id or "default",
            include_history=request.include_history,
        )

        logger.info(f"✅ Response generated: {response.get('response', '')[:50]}...")

        return ChatResponse(
            conversation_id=response.get("conversation_id", "default"),
            user_message=request.message,
            assistant_response=response.get("response", ""),
            tokens_used=response.get("tokens", 0),
            processing_time_ms=response.get("processing_time_ms", 0),
        )
    except Exception as e:
        logger.error(f"❌ Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/info", tags=["Info"])
async def info():
    """Get system information and configuration"""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "ollama": {
            "base_url": settings.OLLAMA_BASE_URL,
            "model": settings.OLLAMA_MODEL,
            "timeout": settings.OLLAMA_TIMEOUT,
        },
        "llm": {
            "context_length": settings.LLM_CONTEXT_LENGTH,
            "temperature": settings.LLM_TEMPERATURE,
            "max_tokens": settings.LLM_MAX_TOKENS,
            "top_p": settings.LLM_TOP_P,
        },
        "database": {
            "type": "SQLite" if "sqlite" in settings.DATABASE_URL else "PostgreSQL",
            "url": settings.DATABASE_URL,
        },
    }


# ============================================================================
# Phase 2: Voice Endpoints
# ============================================================================


@app.post(
    "/api/voice/upload-sample", tags=["Voice"], response_model=VoiceUploadResponse
)
async def upload_voice_sample(file: UploadFile = File(...), user_id: str = Query(...)):
    """
    Upload voice sample for training

    Args:
        file: Audio file (WAV, MP3, M4A)
        user_id: User identifier

    Returns:
        Sample information including ID for later training
    """
    try:
        logger.info(f"📤 Uploading voice sample for user {user_id}")

        # Create assets directory if needed
        sample_dir = Path("assets/voice_samples")
        sample_dir.mkdir(parents=True, exist_ok=True)

        # Save file
        file_path = sample_dir / f"{user_id}_{file.filename}"
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"✅ Sample saved: {file_path}")

        return VoiceUploadResponse(
            sample_id=1,  # TODO: Use actual database ID
            user_id=user_id,
            duration=10.0,  # TODO: Calculate actual duration
            status="uploaded",
        )
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/train", tags=["Voice"], response_model=VoiceTrainResponse)
async def train_voice_clone(request: VoiceTrainRequest):
    """
    Train voice cloning model on uploaded samples

    Args:
        request: Training request with user_id and voice_name

    Returns:
        Training status and voice profile info
    """
    try:
        logger.info(f"🎤 Training voice model for user {request.user_id}")

        voice_service = get_voice_cloning_service()

        # Get audio samples from assets directory
        sample_dir = Path("assets/voice_samples")
        samples = list(sample_dir.glob(f"{request.user_id}_*"))

        if len(samples) < 3:
            raise ValueError(f"Need at least 3 samples, found {len(samples)}")

        # Train on samples
        voice_profile = voice_service.train_on_samples(
            [str(s) for s in samples], request.user_id, request.voice_name
        )

        logger.info(f"✅ Voice training complete for {request.user_id}")

        return VoiceTrainResponse(
            status="complete",
            voice_profile_id=voice_profile.id,
            message=f"Voice trained on {voice_profile.num_samples} samples",
        )
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/synthesize", tags=["Voice"])
async def synthesize_speech(request: VoiceSynthesisRequest):
    """
    Synthesize speech with cloned voice

    Args:
        request: Text to synthesize and voice profile

    Returns:
        Audio file (WAV format)
    """
    try:
        logger.info(f"🔊 Synthesizing: '{request.text[:30]}'")

        voice_service = get_voice_cloning_service()

        # TODO: Load voice profile from database
        # For now: create dummy profile
        from services import VoiceProfile

        profile = VoiceProfile(user_id="user", voice_name="default")

        # Synthesize
        audio_bytes = voice_service.synthesize(request.text, profile, request.language)

        logger.info(f"✅ Synthesis complete: {len(audio_bytes)} bytes")

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=synthesis.wav"},
        )
    except Exception as e:
        logger.error(f"❌ Synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/voice/{user_id}")
async def websocket_voice_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time voice conversation

    Protocol:
    - Client sends: Audio chunks (16kHz mono WAV)
    - Server responds: Audio response + transcript JSON

    Example:
        ws = new WebSocket('ws://localhost:8000/ws/voice/user123');
        ws.send(audioBuffer);
        ws.onmessage = (event) => { playAudio(event.data); };
    """
    await websocket.accept()
    logger.info(f"🎤 Voice WebSocket connected: {user_id}")

    try:
        orchestrator = get_voice_orchestrator()

        while True:
            # Receive audio chunk
            audio_data = await websocket.receive_bytes()
            logger.info(f"📡 Received {len(audio_data)} bytes from {user_id}")

            try:
                # Process through voice pipeline
                result = await orchestrator.process_voice_input(
                    audio_data,
                    user_id,
                    voice_profile=None,  # TODO: Load from database
                    language="en",
                )

                # Send back response
                await websocket.send_json(
                    {
                        "status": "success",
                        "user_text": result["user_text"],
                        "assistant_text": result["assistant_text"],
                        "latency": result["latency"],
                        "audio_bytes": len(result["audio"]),
                    }
                )

                await websocket.send_bytes(result["audio"])

            except Exception as e:
                logger.error(f"❌ Processing error: {e}")
                await websocket.send_json({"status": "error", "message": str(e)})

    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")

    finally:
        await websocket.close()
        logger.info(f"🔌 WebSocket disconnected: {user_id}")


@app.get("/api/voice/profiles/{user_id}", tags=["Voice"])
async def get_voice_profiles(user_id: str):
    """Get all voice profiles for a user"""
    try:
        voice_service = get_voice_cloning_service()
        profiles = voice_service.get_voice_profiles(user_id)
        return {"user_id": user_id, "profiles": profiles}
    except Exception as e:
        logger.error(f"❌ Failed to get profiles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/delete-profile/{profile_id}", tags=["Voice"])
async def delete_voice_profile(profile_id: int):
    """Delete a voice profile"""
    try:
        logger.info(f"🗑️ Deleting voice profile {profile_id}")
        # TODO: Implement database deletion
        return {"status": "deleted", "profile_id": profile_id}
    except Exception as e:
        logger.error(f"❌ Deletion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Phase 3: Avatar Endpoints
# ============================================================================


@app.post(
    "/api/avatar/upload-photo", tags=["Avatar"], response_model=AvatarUploadResponse
)
async def upload_avatar_photo(file: UploadFile = File(...), user_id: str = Query(...)):
    """
    Upload avatar photo for animation

    Args:
        file: Image file (JPG, PNG, WebP)
        user_id: User identifier

    Returns:
        Photo metadata including ID for later use
    """
    try:
        logger.info(f"📸 Uploading avatar photo for user {user_id}")

        # Create assets directory if needed
        photo_dir = Path("assets/avatar_photos")
        photo_dir.mkdir(parents=True, exist_ok=True)

        # Save file
        file_path = photo_dir / f"{user_id}_{file.filename}"
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Validate photo using avatar service
        avatar_service = get_avatar_service()
        is_valid, msg = avatar_service.validate_photo(str(file_path))

        if not is_valid:
            logger.error(f"⚠️  Photo validation warning: {msg}")

        logger.info(f"✅ Avatar photo saved: {file_path}")

        return AvatarUploadResponse(
            photo_id=1,  # TODO: Use actual database ID
            user_id=user_id,
            file_path=str(file_path),
            status="uploaded",
        )
    except Exception as e:
        logger.error(f"❌ Avatar photo upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/avatar/create", tags=["Avatar"], response_model=AvatarCreateResponse)
async def create_avatar_profile(request: AvatarCreateRequest):
    """
    Create avatar profile from uploaded photos

    Args:
        request: Avatar creation request with user_id and photos

    Returns:
        Avatar profile ID and metadata
    """
    try:
        logger.info(f"🎬 Creating avatar profile for user {request.user_id}")

        avatar_service = get_avatar_service()

        # Get uploaded photos from assets directory
        photo_dir = Path("assets/avatar_photos")
        photos = list(photo_dir.glob(f"{request.user_id}_*"))

        if len(photos) < 1:
            raise ValueError("Need at least 1 avatar photo")

        # Create profile
        profile = avatar_service.create_avatar_profile(
            request.user_id, [str(p) for p in photos], request.avatar_name
        )

        logger.info(
            f"✅ Avatar profile created: {request.avatar_name} with {len(photos)} photos"
        )

        return AvatarCreateResponse(
            avatar_id=1,  # TODO: Use actual database ID
            user_id=request.user_id,
            avatar_name=request.avatar_name,
            status="created",
            message=f"Avatar created from {len(photos)} photos",
        )
    except Exception as e:
        logger.error(f"❌ Avatar creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/api/avatar/generate-video",
    tags=["Avatar"],
    response_model=AvatarGenerateVideoResponse,
)
async def generate_avatar_video(request: AvatarGenerateVideoRequest):
    """
    Generate animated avatar video from audio

    Args:
        request: Generation request with avatar_id and audio_path

    Returns:
        Generated video path and metadata
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎬 Generating avatar video (Avatar ID: {request.avatar_id})")

        avatar_service = get_avatar_service()

        # Get avatar photos from assets
        photo_dir = Path("assets/avatar_photos")
        photos = list(photo_dir.glob(f"{request.user_id}_*"))

        if not photos:
            raise ValueError("Avatar profile not found")

        # Create avatar profile
        profile = avatar_service.create_avatar_profile(
            request.user_id, [str(p) for p in photos], "default"
        )

        # Generate video with optional lip-sync
        output_dir = Path("assets/avatar_videos")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"avatar_{request.user_id}_{int(time.time())}.mp4"

        video_path = avatar_service.generate_avatar_video(
            profile, request.audio_path, str(output_path)
        )

        # Generate lip-sync if requested
        if request.add_lipsync:
            logger.info("🎵 Generating lip-sync...")
            lipsync_gen = get_lipsync_generator()
            lipsync_frames = lipsync_gen.generate_lipsync(request.audio_path)
            logger.info(f"✅ Generated {len(lipsync_frames)} lip-sync frames")

        elapsed = time.time() - start_time

        logger.info(f"✅ Avatar video generated in {elapsed:.1f}s")

        return AvatarGenerateVideoResponse(
            video_id=1,  # TODO: Use actual database ID
            avatar_id=request.avatar_id,
            video_path=video_path,
            duration=30.0,  # TODO: Calculate actual duration
            status="completed",
            generation_time=elapsed,
        )
    except Exception as e:
        logger.error(f"❌ Video generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/avatar/profiles/{user_id}", tags=["Avatar"])
async def get_avatar_profiles(user_id: str):
    """Get all avatar profiles for a user"""
    try:
        logger.info(f"📋 Listing avatar profiles for {user_id}")

        # Get avatars from assets directory
        photo_dir = Path("assets/avatar_photos")
        photos = list(photo_dir.glob(f"{user_id}_*"))

        return {
            "user_id": user_id,
            "avatar_count": len(photos),
            "profiles": [
                {
                    "id": 1,
                    "avatar_name": "default",
                    "photo_count": len(photos),
                    "created_at": "2026-03-22T00:00:00Z",
                }
            ],
        }
    except Exception as e:
        logger.error(f"❌ Failed to get avatar profiles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/avatar/delete/{avatar_id}", tags=["Avatar"])
async def delete_avatar_profile(avatar_id: int):
    """Delete an avatar profile"""
    try:
        logger.info(f"🗑️ Deleting avatar {avatar_id}")
        # TODO: Implement database deletion
        return {"status": "deleted", "avatar_id": avatar_id}
    except Exception as e:
        logger.error(f"❌ Avatar deletion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/avatar/{user_id}")
async def websocket_avatar_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time avatar interaction

    Protocol:
    - Client sends: Audio chunks + avatar_id
    - Server responds: Generated avatar video frames + transcript

    Example:
        ws = new WebSocket('ws://localhost:8000/ws/avatar/user123');
        ws.send(JSON.stringify({avatar_id: 1, audio: audioBuffer}));
        ws.onmessage = (event) => { showAvatarVideo(event.data); };
    """
    await websocket.accept()
    logger.info(f"🎬 Avatar WebSocket connected: {user_id}")

    try:
        avatar_service = get_avatar_service()
        orchestrator = get_voice_orchestrator()

        while True:
            # Receive audio chunk with avatar info
            data = await websocket.receive_json()
            logger.info(f"📡 Received avatar request from {user_id}")

            try:
                avatar_id = data.get("avatar_id", 1)
                audio_data_b64 = data.get("audio")

                # Decode audio
                import base64

                audio_bytes = base64.b64decode(audio_data_b64)

                # Process through voice pipeline
                voice_result = await orchestrator.process_voice_input(
                    audio_bytes, user_id, voice_profile=None, language="en"
                )

                # Generate avatar video
                import tempfile

                with tempfile.NamedTemporaryFile(suffix=".wav") as f:
                    f.write(audio_bytes)
                    f.flush()

                    # Get avatar photos
                    photo_dir = Path("assets/avatar_photos")
                    photos = list(photo_dir.glob(f"{user_id}_*"))

                    if photos:
                        profile = avatar_service.create_avatar_profile(
                            user_id, [str(p) for p in photos], "default"
                        )

                        output_path = (
                            Path("assets/avatar_videos") / f"avatar_ws_{user_id}.mp4"
                        )
                        video_path = avatar_service.generate_avatar_video(
                            profile, f.name, str(output_path)
                        )

                        # Send response
                        with open(video_path, "rb") as vf:
                            video_data = base64.b64encode(vf.read()).decode()

                        await websocket.send_json(
                            {
                                "status": "success",
                                "user_text": voice_result["user_text"],
                                "assistant_text": voice_result["assistant_text"],
                                "latency": voice_result["latency"],
                                "video_bytes": len(video_data),
                                "video": video_data[:1000],  # Send truncated preview
                            }
                        )

            except Exception as e:
                logger.error(f"❌ Avatar processing error: {e}")
                await websocket.send_json({"status": "error", "message": str(e)})

    except Exception as e:
        logger.error(f"❌ Avatar WebSocket error: {e}")

    finally:
        await websocket.close()
        logger.info(f"🔌 Avatar WebSocket disconnected: {user_id}")


# ============================================================================
# Phase 4: Image & Video Generation Endpoints
# ============================================================================


@app.post(
    "/api/image/generate",
    tags=["Image Generation"],
    response_model=ImageGenerationResponse,
)
async def generate_image(request: ImageGenerationRequest):
    """
    Generate an image from text using Stable Diffusion

    Args:
        request: Image generation parameters (prompt, dimensions, guidance scale, etc.)

    Returns:
        Generated image path and metadata
    """
    try:
        import time

        start_time = time.time()

        logger.info(
            f"🎨 Generating image for user {request.user_id}: {request.prompt[:50]}"
        )

        image_service = get_image_generation_service()

        # Create output directory
        output_dir = Path("assets/generated_images")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"image_{request.user_id}_{int(time.time())}.png"

        # Generate image
        image_path = image_service.generate_image(
            prompt=request.prompt,
            num_steps=request.num_steps,
            guidance_scale=request.guidance_scale,
            height=request.height,
            width=request.width,
            seed=request.seed,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Image generated in {elapsed:.1f}s: {image_path}")

        return ImageGenerationResponse(
            image_id=1,  # TODO: Use actual database ID
            user_id=request.user_id,
            prompt=request.prompt,
            image_path=image_path,
            status="completed",
            generation_time=elapsed,
        )

    except Exception as e:
        logger.error(f"❌ Image generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/image/batch-generate", tags=["Image Generation"])
async def batch_generate_images(
    user_id: str = Query(...),
    prompts: list = Query(...),
    num_steps: int = Query(50),
    guidance_scale: float = Query(7.5),
):
    """
    Generate multiple images in batch

    Args:
        user_id: User identifier
        prompts: List of text prompts
        num_steps: Number of inference steps
        guidance_scale: Guidance scale for generation

    Returns:
        List of generated image paths
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎨 Batch generating {len(prompts)} images for user {user_id}")

        image_service = get_image_generation_service()

        output_dir = Path("assets/generated_images")
        output_dir.mkdir(parents=True, exist_ok=True)

        images = image_service.batch_generate(
            prompts=prompts,
            num_steps=num_steps,
            guidance_scale=guidance_scale,
            output_dir=str(output_dir),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Batch generation completed in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "image_count": len(images),
            "images": images,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Batch generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/image/edit", tags=["Image Generation"])
async def edit_image(
    user_id: str = Query(...),
    image_path: str = Query(...),
    prompt: str = Query(...),
    mask_path: str = Query(None),
):
    """
    Edit an image using inpainting

    Args:
        user_id: User identifier
        image_path: Path to original image
        prompt: Text describing edits
        mask_path: Path to mask image (optional)

    Returns:
        Edited image path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"✏️ Editing image for user {user_id}: {prompt[:50]}")

        image_service = get_image_generation_service()

        output_dir = Path("assets/generated_images")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"edited_{user_id}_{int(time.time())}.png"

        edited_image = image_service.edit_image(
            image_path=image_path,
            prompt=prompt,
            mask_path=mask_path,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Image edited in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "original_path": image_path,
            "edited_path": edited_image,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Image editing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/image/models",
    tags=["Image Generation"],
    response_model=MediaModelInfoResponse,
)
async def get_image_models():
    """
    Get available image generation models

    Returns:
        List of supported models and system info
    """
    try:
        logger.info("📋 Fetching available image models")

        image_service = get_image_generation_service()

        return MediaModelInfoResponse(
            image_models={
                "sd-1.5": {
                    "name": "Stable Diffusion 1.5",
                    "size": "4GB",
                    "speed": "Medium",
                },
                "sd-2.1": {
                    "name": "Stable Diffusion 2.1",
                    "size": "5GB",
                    "speed": "Medium",
                },
                "sdxl": {"name": "SDXL", "size": "7GB", "speed": "Slow"},
                "sdxl-turbo": {"name": "SDXL Turbo", "size": "7GB", "speed": "Fast"},
            },
            video_models={},
            gpu_available=torch.cuda.is_available(),
            device="cuda" if torch.cuda.is_available() else "cpu",
        )

    except Exception as e:
        logger.error(f"❌ Failed to fetch models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/api/video/generate",
    tags=["Video Generation"],
    response_model=VideoGenerationResponse,
)
async def generate_video(request: VideoGenerationRequest):
    """
    Generate a video from text using text-to-video models

    Args:
        request: Video generation parameters

    Returns:
        Generated video path and metadata
    """
    try:
        import time

        start_time = time.time()

        logger.info(
            f"🎬 Generating video for user {request.user_id}: {request.prompt[:50]}"
        )

        video_service = get_video_generation_service()

        # Create output directory
        output_dir = Path("assets/generated_videos")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"video_{request.user_id}_{int(time.time())}.mp4"

        # Generate video
        video_path = video_service.generate_video(
            prompt=request.prompt,
            num_steps=request.num_steps,
            height=request.height,
            width=request.width,
            duration=request.duration,
            seed=request.seed,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Video generated in {elapsed:.1f}s: {video_path}")

        return VideoGenerationResponse(
            video_id=1,  # TODO: Use actual database ID
            user_id=request.user_id,
            prompt=request.prompt,
            video_path=video_path,
            duration=request.duration,
            status="completed",
            generation_time=elapsed,
        )

    except Exception as e:
        logger.error(f"❌ Video generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/video/image-to-video", tags=["Video Generation"])
async def image_to_video(
    user_id: str = Query(...),
    image_path: str = Query(...),
    prompt: str = Query(""),
    duration: float = Query(5.0),
):
    """
    Convert a static image to video

    Args:
        user_id: User identifier
        image_path: Path to input image
        prompt: Optional text description
        duration: Video duration in seconds

    Returns:
        Generated video path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎬 Converting image to video for user {user_id}")

        video_service = get_video_generation_service()

        output_dir = Path("assets/generated_videos")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"i2v_{user_id}_{int(time.time())}.mp4"

        # Convert image to video
        video_path = video_service.image_to_video(
            image_path=image_path,
            prompt=prompt,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Video created in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "image_path": image_path,
            "video_path": video_path,
            "duration": duration,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Image-to-video conversion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/video/models", tags=["Video Generation"])
async def get_video_models():
    """
    Get available video generation models

    Returns:
        List of supported video models and system info
    """
    try:
        logger.info("📋 Fetching available video models")

        video_service = get_video_generation_service()

        return {
            "video_models": {
                "modelscope": {
                    "name": "ModelScope",
                    "duration": "2-5s",
                    "speed": "Fast",
                },
                "zeroscope": {
                    "name": "Zeroscope",
                    "duration": "2-10s",
                    "speed": "Medium",
                },
                "hunyuanvideo": {
                    "name": "HunyuanVideo",
                    "duration": "5-20s",
                    "speed": "Slow",
                },
            },
            "gpu_available": torch.cuda.is_available(),
            "device": "cuda" if torch.cuda.is_available() else "cpu",
            "warning": "GPU strongly recommended for video generation",
        }

    except Exception as e:
        logger.error(f"❌ Failed to fetch video models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/media/generate-scene", tags=["Media Orchestration"])
async def generate_avatar_scene(
    user_id: str = Query(...),
    avatar_id: int = Query(...),
    background_prompt: str = Query(...),
    audio_path: str = Query(...),
):
    """
    Generate a complete avatar scene with animated background

    Args:
        user_id: User identifier
        avatar_id: Avatar profile ID
        background_prompt: Text description for background image
        audio_path: Path to audio file

    Returns:
        Generated scene video path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎬 Generating avatar scene for user {user_id}")

        orchestrator = get_media_orchestrator()

        output_dir = Path("assets/generated_scenes")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"scene_{user_id}_{int(time.time())}.mp4"

        # Generate scene
        scene_path = orchestrator.generate_avatar_scene(
            user_id=user_id,
            background_prompt=background_prompt,
            audio_path=audio_path,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Scene generated in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "avatar_id": avatar_id,
            "scene_path": scene_path,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Scene generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/media/multi-scene", tags=["Media Orchestration"])
async def create_multi_scene_video(
    user_id: str = Query(...),
    scenes: list = Query(...),  # List of scene descriptions
):
    """
    Create a video with multiple scenes

    Args:
        user_id: User identifier
        scenes: List of scene descriptions with prompts and durations

    Returns:
        Generated multi-scene video path
    """
    try:
        import time

        start_time = time.time()

        logger.info(
            f"🎬 Creating multi-scene video for user {user_id}, {len(scenes)} scenes"
        )

        orchestrator = get_media_orchestrator()

        output_dir = Path("assets/generated_scenes")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"multiscene_{user_id}_{int(time.time())}.mp4"

        # Create multi-scene video
        video_path = orchestrator.create_multi_scene_video(
            scenes=scenes, output_path=str(output_path)
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Multi-scene video created in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "scene_count": len(scenes),
            "video_path": video_path,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Multi-scene video creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/media/status", tags=["Media Orchestration"])
async def get_media_orchestrator_status():
    """
    Get media orchestrator status and system info

    Returns:
        System status with GPU info and available models
    """
    try:
        logger.info("📋 Fetching media orchestrator status")

        return {
            "status": "ready",
            "gpu_available": torch.cuda.is_available(),
            "device": "cuda" if torch.cuda.is_available() else "cpu",
            "services_available": {
                "avatar": True,
                "voice": True,
                "image_generation": True,
                "video_generation": True,
            },
            "timestamp": time.time(),
        }

    except Exception as e:
        logger.error(f"❌ Failed to get status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Phase 5: Audio Enhancement & Soundtrack Generation Endpoints
# ============================================================================


@app.post(
    "/api/audio/enhance",
    tags=["Audio Enhancement"],
    response_model=AudioEnhancementResponse,
)
async def enhance_audio(request: AudioEnhancementRequest):
    """
    Enhance audio quality with noise reduction and normalization

    Args:
        request: Audio enhancement parameters

    Returns:
        Enhanced audio path and metadata
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🔊 Enhancing audio for user {request.user_id}")

        enhancement_service = get_audio_enhancement_service()

        output_dir = Path("assets/enhanced_audio")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"enhanced_{request.user_id}_{int(time.time())}.wav"

        # Enhance audio
        enhanced_path = enhancement_service.enhance_audio(
            audio_path=request.audio_path,
            reduce_noise=request.reduce_noise,
            normalize=request.normalize,
            equalize=request.equalize,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Audio enhanced in {elapsed:.1f}s")

        return AudioEnhancementResponse(
            audio_id=1,  # TODO: Use actual database ID
            user_id=request.user_id,
            original_path=request.audio_path,
            enhanced_path=enhanced_path,
            status="completed",
            processing_time=elapsed,
        )

    except Exception as e:
        logger.error(f"❌ Audio enhancement failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/denoise", tags=["Audio Enhancement"])
async def denoise_audio(user_id: str = Query(...), audio_path: str = Query(...)):
    """
    Apply advanced denoising to audio

    Args:
        user_id: User identifier
        audio_path: Path to input audio

    Returns:
        Denoised audio path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🔇 Denoising audio for user {user_id}")

        enhancement_service = get_audio_enhancement_service()

        output_dir = Path("assets/enhanced_audio")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"denoised_{user_id}_{int(time.time())}.wav"

        denoised_path = enhancement_service.denoise_audio(
            audio_path=audio_path, output_path=str(output_path)
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Denoising completed in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "original_path": audio_path,
            "denoised_path": denoised_path,
            "processing_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Denoising failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/compress", tags=["Audio Enhancement"])
async def compress_audio(
    user_id: str = Query(...),
    audio_path: str = Query(...),
    ratio: float = Query(4.0),
):
    """
    Apply dynamic range compression

    Args:
        user_id: User identifier
        audio_path: Path to input audio
        ratio: Compression ratio (default: 4.0)

    Returns:
        Compressed audio path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"📉 Compressing audio for user {user_id}")

        enhancement_service = get_audio_enhancement_service()

        output_dir = Path("assets/enhanced_audio")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"compressed_{user_id}_{int(time.time())}.wav"

        compressed_path = enhancement_service.compress_audio(
            audio_path=audio_path, ratio=ratio, output_path=str(output_path)
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Compression completed in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "original_path": audio_path,
            "compressed_path": compressed_path,
            "ratio": ratio,
            "processing_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Compression failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/mix", tags=["Audio Enhancement"])
async def mix_audio(
    user_id: str = Query(...),
    audio_paths: list = Query(...),
    volumes: list = Query(None),
):
    """
    Mix multiple audio tracks

    Args:
        user_id: User identifier
        audio_paths: List of audio file paths
        volumes: List of volume levels (0-1)

    Returns:
        Mixed audio path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎼 Mixing {len(audio_paths)} audio tracks for user {user_id}")

        enhancement_service = get_audio_enhancement_service()

        output_dir = Path("assets/enhanced_audio")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"mixed_{user_id}_{int(time.time())}.wav"

        mixed_path = enhancement_service.mix_audio(
            audio_paths=audio_paths,
            volumes=volumes,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Mixing completed in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "track_count": len(audio_paths),
            "mixed_path": mixed_path,
            "processing_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Audio mixing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/api/soundtrack/generate",
    tags=["Soundtrack Generation"],
    response_model=SoundtrackGenerationResponse,
)
async def generate_soundtrack(request: SoundtrackGenerationRequest):
    """
    Generate background music from text description

    Args:
        request: Soundtrack generation parameters

    Returns:
        Generated soundtrack path and metadata
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎵 Generating soundtrack for user {request.user_id}")

        soundtrack_service = get_soundtrack_generation_service()

        output_dir = Path("assets/generated_soundtracks")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = (
            output_dir / f"soundtrack_{request.user_id}_{int(time.time())}.wav"
        )

        # Generate soundtrack
        soundtrack_path = soundtrack_service.generate_soundtrack(
            description=request.description,
            duration=request.duration,
            mood=request.mood,
            bpm=request.bpm,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Soundtrack generated in {elapsed:.1f}s")

        return SoundtrackGenerationResponse(
            soundtrack_id=1,  # TODO: Use actual database ID
            user_id=request.user_id,
            description=request.description,
            soundtrack_path=soundtrack_path,
            duration=request.duration,
            mood=request.mood,
            status="completed",
            generation_time=elapsed,
        )

    except Exception as e:
        logger.error(f"❌ Soundtrack generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/soundtrack/ambient", tags=["Soundtrack Generation"])
async def generate_ambient_soundtrack(
    user_id: str = Query(...),
    scene_description: str = Query(...),
    duration: float = Query(60.0),
):
    """
    Generate ambient music for video scenes

    Args:
        user_id: User identifier
        scene_description: Description of video scene
        duration: Duration in seconds

    Returns:
        Generated ambient soundtrack path
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎬 Generating ambient soundtrack for user {user_id}")

        soundtrack_service = get_soundtrack_generation_service()

        output_dir = Path("assets/generated_soundtracks")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"ambient_{user_id}_{int(time.time())}.wav"

        soundtrack_path = soundtrack_service.generate_ambient_soundtrack(
            scene_description=scene_description,
            duration=duration,
            output_path=str(output_path),
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Ambient soundtrack generated in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "scene_description": scene_description,
            "soundtrack_path": soundtrack_path,
            "duration": duration,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Ambient soundtrack generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/soundtrack/collection", tags=["Soundtrack Generation"])
async def create_soundtrack_collection(
    user_id: str = Query(...),
    scenes: list = Query(...),  # List of scene dicts
):
    """
    Generate soundtracks for multiple video scenes

    Args:
        user_id: User identifier
        scenes: List of scene descriptions with durations

    Returns:
        List of generated soundtrack paths
    """
    try:
        import time

        start_time = time.time()

        logger.info(f"🎼 Creating soundtrack collection for user {user_id}")

        soundtrack_service = get_soundtrack_generation_service()

        output_dir = Path("assets/generated_soundtracks")
        output_dir.mkdir(parents=True, exist_ok=True)

        soundtracks = soundtrack_service.create_soundtrack_collection(
            scenes=scenes, output_dir=str(output_dir)
        )

        elapsed = time.time() - start_time

        logger.info(f"✅ Soundtrack collection created in {elapsed:.1f}s")

        return {
            "user_id": user_id,
            "scene_count": len(scenes),
            "soundtracks": soundtracks,
            "generation_time": elapsed,
            "status": "completed",
        }

    except Exception as e:
        logger.error(f"❌ Soundtrack collection creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/audio/moods", tags=["Soundtrack Generation"])
async def get_available_moods():
    """
    Get available mood options for soundtrack generation

    Returns:
        Dictionary of available moods with parameters
    """
    try:
        logger.info("📋 Fetching available moods")

        soundtrack_service = get_soundtrack_generation_service()

        return {
            "moods": soundtrack_service.MOODS,
            "status": "ready",
        }

    except Exception as e:
        logger.error(f"❌ Failed to fetch moods: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled Exception: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ============================================================================
# Helper Functions
# ============================================================================


async def check_database_health() -> bool:
    """Check if database is accessible"""
    try:
        # TODO: Implement actual database health check
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# ============================================================================
# Run Application
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting server on {settings.API_HOST}:{settings.API_PORT}")

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level="info",
    )
