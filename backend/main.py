"""Astra — Local AI Assistant Backend.

FastAPI application with chat, voice, image, video, audio, avatar, and training endpoints.
All AI processing happens locally via Ollama + local ML models.
"""

import logging
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from config import settings
from database import init_db
from llm import llm

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("astra")

# Ensure storage dirs exist
Path("storage/images").mkdir(parents=True, exist_ok=True)
Path("storage/videos").mkdir(parents=True, exist_ok=True)
Path("storage/audio").mkdir(parents=True, exist_ok=True)
Path("storage/avatars").mkdir(parents=True, exist_ok=True)
Path("storage/training").mkdir(parents=True, exist_ok=True)
Path("storage/voice").mkdir(parents=True, exist_ok=True)


# --- Lifespan ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting Astra v{settings.APP_VERSION}")
    logger.info(f"Model: {settings.OLLAMA_MODEL}  |  Ollama: {settings.OLLAMA_URL}")

    try:
        init_db()
        logger.info("Database ready")
    except Exception as e:
        logger.error(f"Database init failed: {e}")

    try:
        ok = await llm.health()
        logger.info(
            "Ollama connected"
            if ok
            else "Ollama not responding — start it with: ollama serve"
        )
    except Exception as e:
        logger.warning(f"Ollama check failed: {e}")

    yield
    logger.info("Astra stopped")


# --- App ---

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Local AI assistant — chat, voice, image, video, audio, avatar, training",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated media files
app.mount("/storage", StaticFiles(directory="storage"), name="storage")


# --- Request/Response Models ---


class ChatRequest(BaseModel):
    message: str
    session: str = "default"
    history: bool = True


class ChatResponse(BaseModel):
    session: str
    message: str
    response: str
    time_ms: float = 0


class HealthResponse(BaseModel):
    status: str
    ollama: bool
    model: str


class ImageRequest(BaseModel):
    prompt: str
    model: str = "sd-1.5"
    steps: int = 30
    width: int = 512
    height: int = 512
    seed: Optional[int] = None


class ImageFromTrainedRequest(BaseModel):
    prompt: str
    lora_path: str
    trigger_word: str = "astra_subject"
    steps: int = 30
    width: int = 512
    height: int = 512
    seed: Optional[int] = None


class VideoRequest(BaseModel):
    prompt: str
    model: str = "zeroscope"
    steps: int = 40
    frames: int = 24
    width: int = 576
    height: int = 320
    seed: Optional[int] = None


class AudioGenRequest(BaseModel):
    prompt: str
    duration: float = 10.0


class TrainRequest(BaseModel):
    dataset: str = "default"
    name: str = "my_lora"
    base_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    trigger_word: str = "astra_subject"
    steps: int = 500
    lr: float = 1e-4
    rank: int = 4


# ============================================================
# CORE ROUTES
# ============================================================


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "features": ["chat", "voice", "image", "video", "audio", "avatar", "training"],
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    try:
        ollama_ok = await llm.health()
        return HealthResponse(
            status="healthy" if ollama_ok else "degraded",
            ollama=ollama_ok,
            model=settings.OLLAMA_MODEL,
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(status="error", ollama=False, model=settings.OLLAMA_MODEL)


@app.get("/info")
async def info():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "features": ["chat", "voice", "image", "video", "audio", "avatar", "training"],
        "ollama": {
            "url": settings.OLLAMA_URL,
            "model": settings.OLLAMA_MODEL,
            "timeout": settings.OLLAMA_TIMEOUT,
        },
        "llm": {
            "context": settings.LLM_CONTEXT,
            "temperature": settings.LLM_TEMPERATURE,
            "max_tokens": settings.LLM_MAX_TOKENS,
        },
    }


# ============================================================
# CHAT ROUTES
# ============================================================


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    try:
        result = await llm.chat(req.message, req.session, req.history)
        return ChatResponse(
            session=result["session"],
            message=req.message,
            response=result["response"],
            time_ms=result["time_ms"],
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(500, f"Failed to generate response: {e}")


@app.get("/sessions")
async def sessions():
    return {"sessions": llm.get_sessions()}


@app.get("/history/{session}")
async def history(session: str):
    return {"session": session, "messages": llm.get_history(session)}


@app.delete("/history/{session}")
async def clear(session: str):
    llm.clear_history(session)
    return {"status": "cleared", "session": session}


# ============================================================
# VOICE ROUTES
# ============================================================


@app.post("/voice")
async def voice_chat(audio: UploadFile = File(...), session: str = Form("default")):
    """Voice chat — send audio, get text + audio response."""
    try:
        from services.voice import get_voice

        data = await audio.read()
        voice = get_voice()
        result = await voice.process(data, session)
        return result
    except Exception as e:
        logger.error(f"Voice error: {e}")
        raise HTTPException(500, f"Voice processing failed: {e}")


@app.post("/voice/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Transcribe audio to text."""
    try:
        from services.stt import get_stt

        data = await audio.read()
        stt = get_stt()
        result = stt.transcribe_bytes(data)
        return result
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise HTTPException(500, f"Transcription failed: {e}")


@app.post("/voice/tts")
async def text_to_speech(text: str = Form(...), voice: str = Form("default")):
    """Convert text to speech audio."""
    try:
        from services.tts import get_tts

        tts = get_tts()
        audio_bytes = tts.synthesize(text, voice)

        import tempfile

        out = Path("storage/voice") / f"tts_{int(time.time())}.wav"
        out.write_bytes(audio_bytes)

        return FileResponse(str(out), media_type="audio/wav", filename="speech.wav")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(500, f"Text-to-speech failed: {e}")


@app.websocket("/ws/voice")
async def voice_websocket(ws: WebSocket):
    """Real-time voice chat via WebSocket."""
    await ws.accept()
    logger.info("Voice WebSocket connected")
    try:
        from services.voice import get_voice

        voice = get_voice()
        while True:
            data = await ws.receive_bytes()
            result = await voice.process(data, "websocket")
            await ws.send_json(result)
    except WebSocketDisconnect:
        logger.info("Voice WebSocket disconnected")
    except Exception as e:
        logger.error(f"Voice WS error: {e}")
        await ws.close(code=1011)


# ============================================================
# IMAGE ROUTES
# ============================================================


@app.post("/image/generate")
async def generate_image(req: ImageRequest):
    """Generate image from text prompt."""
    try:
        from services.image import get_image_gen

        gen = get_image_gen()
        path = gen.generate(
            prompt=req.prompt,
            model=req.model,
            steps=req.steps,
            width=req.width,
            height=req.height,
            seed=req.seed,
        )
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        raise HTTPException(500, f"Image generation failed: {e}")


@app.post("/image/from-image")
async def image_from_image(
    image: UploadFile = File(...),
    prompt: str = Form(""),
    strength: float = Form(0.75),
    steps: int = Form(30),
):
    """Generate image from source image (img2img)."""
    try:
        from services.image import get_image_gen

        data = await image.read()

        # Save source temporarily
        src = Path("storage/images") / f"src_{int(time.time())}.png"
        src.write_bytes(data)

        gen = get_image_gen()
        path = gen.from_image(
            source=str(src), prompt=prompt, strength=strength, steps=steps
        )
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Img2img error: {e}")
        raise HTTPException(500, f"Image-to-image failed: {e}")


@app.post("/image/from-trained")
async def image_from_trained(req: ImageFromTrainedRequest):
    """Generate image using trained LoRA model."""
    try:
        from services.image import get_image_gen

        gen = get_image_gen()
        path = gen.from_trained(
            prompt=req.prompt,
            lora_path=req.lora_path,
            trigger_word=req.trigger_word,
            steps=req.steps,
            width=req.width,
            height=req.height,
            seed=req.seed,
        )
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Trained image gen error: {e}")
        raise HTTPException(500, f"Trained generation failed: {e}")


# ============================================================
# VIDEO ROUTES
# ============================================================


@app.post("/video/generate")
async def generate_video(req: VideoRequest):
    """Generate video from text prompt."""
    try:
        from services.video import get_video_gen

        gen = get_video_gen()
        path = gen.generate(
            prompt=req.prompt,
            model=req.model,
            steps=req.steps,
            frames=req.frames,
            width=req.width,
            height=req.height,
            seed=req.seed,
        )
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Video generation error: {e}")
        raise HTTPException(500, f"Video generation failed: {e}")


@app.post("/video/from-image")
async def video_from_image(
    image: UploadFile = File(...),
    prompt: str = Form(""),
    steps: int = Form(40),
    frames: int = Form(24),
):
    """Generate video from source image."""
    try:
        from services.video import get_video_gen

        data = await image.read()
        src = Path("storage/videos") / f"src_{int(time.time())}.png"
        src.write_bytes(data)

        gen = get_video_gen()
        path = gen.from_image(
            source=str(src), prompt=prompt, steps=steps, frames=frames
        )
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Image-to-video error: {e}")
        raise HTTPException(500, f"Image-to-video failed: {e}")


# ============================================================
# AUDIO ROUTES
# ============================================================


@app.post("/audio/enhance")
async def enhance_audio(
    audio: UploadFile = File(...),
    noise_reduce: bool = Form(True),
    normalize: bool = Form(True),
):
    """Enhance audio — noise reduction and normalization."""
    try:
        from services.audio import get_audio

        data = await audio.read()
        src = Path("storage/audio") / f"src_{int(time.time())}.wav"
        src.write_bytes(data)

        svc = get_audio()
        path = svc.enhance(str(src), noise_reduce=noise_reduce, normalize=normalize)
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Audio enhance error: {e}")
        raise HTTPException(500, f"Audio enhancement failed: {e}")


@app.post("/audio/generate")
async def generate_soundtrack(req: AudioGenRequest):
    """Generate music/soundtrack from text prompt."""
    try:
        from services.audio import get_audio

        svc = get_audio()
        path = svc.generate_music(prompt=req.prompt, duration=req.duration)
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except Exception as e:
        logger.error(f"Music generation error: {e}")
        raise HTTPException(500, f"Music generation failed: {e}")


# ============================================================
# AVATAR ROUTES
# ============================================================


@app.post("/avatar/upload")
async def upload_avatar(image: UploadFile = File(...)):
    """Upload avatar photo."""
    try:
        from services.avatar import get_avatar

        data = await image.read()
        avatar = get_avatar()
        profile = avatar.upload(data, image.filename or "avatar.png")
        return profile
    except Exception as e:
        logger.error(f"Avatar upload error: {e}")
        raise HTTPException(500, f"Avatar upload failed: {e}")


@app.get("/avatar/profile")
async def avatar_profile():
    """Get current avatar profile."""
    try:
        from services.avatar import get_avatar

        avatar = get_avatar()
        profile = avatar.get_profile()
        if profile is None:
            raise HTTPException(404, "No avatar uploaded")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Avatar profile error: {e}")
        raise HTTPException(500, f"Avatar profile failed: {e}")


@app.post("/avatar/animate")
async def animate_avatar(
    text: str = Form(""),
    duration: float = Form(5.0),
    audio: Optional[UploadFile] = File(None),
):
    """Animate the avatar — basic lip-sync."""
    try:
        from services.avatar import get_avatar

        avatar = get_avatar()
        audio_path = None
        if audio:
            data = await audio.read()
            audio_path = str(Path("storage/avatars") / f"audio_{int(time.time())}.wav")
            Path(audio_path).write_bytes(data)

        path = avatar.animate(audio_path=audio_path, text=text, duration=duration)
        return {"path": path, "url": f"/storage/{Path(path).relative_to('storage')}"}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Avatar animate error: {e}")
        raise HTTPException(500, f"Avatar animation failed: {e}")


# ============================================================
# TRAINING ROUTES
# ============================================================


@app.post("/train/upload")
async def upload_training_data(
    files: list[UploadFile] = File(...),
    dataset: str = Form("default"),
):
    """Upload images/videos for training."""
    try:
        from services.train import get_trainer

        trainer = get_trainer()
        file_data = [
            (f.filename or f"file_{i}", await f.read()) for i, f in enumerate(files)
        ]
        result = trainer.upload_data(file_data, dataset)
        return result
    except Exception as e:
        logger.error(f"Training upload error: {e}")
        raise HTTPException(500, f"Upload failed: {e}")


@app.post("/train/start")
async def start_training(req: TrainRequest):
    """Start LoRA fine-tuning on uploaded data."""
    try:
        from services.train import get_trainer

        trainer = get_trainer()
        job = trainer.start(
            dataset=req.dataset,
            name=req.name,
            base_model=req.base_model,
            trigger_word=req.trigger_word,
            steps=req.steps,
            lr=req.lr,
            rank=req.rank,
        )
        return job
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Training start error: {e}")
        raise HTTPException(500, f"Training failed to start: {e}")


@app.get("/train/status/{job_id}")
async def training_status(job_id: str):
    """Get training job status."""
    from services.train import get_trainer

    trainer = get_trainer()
    job = trainer.status(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@app.get("/train/jobs")
async def training_jobs():
    """List all training jobs."""
    from services.train import get_trainer

    trainer = get_trainer()
    return {"jobs": trainer.list_jobs()}


@app.get("/train/models")
async def trained_models():
    """List trained LoRA models."""
    from services.train import get_trainer

    trainer = get_trainer()
    return {"models": trainer.list_models()}


# ============================================================
# GALLERY ROUTES
# ============================================================


@app.get("/gallery/images")
async def gallery_images():
    """List generated images."""
    images = sorted(
        Path("storage/images").glob("*.*"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return {
        "images": [
            {
                "name": p.name,
                "url": f"/storage/images/{p.name}",
                "size": p.stat().st_size,
                "created": p.stat().st_mtime,
            }
            for p in images
            if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")
            and not p.name.startswith("src_")
        ]
    }


@app.get("/gallery/videos")
async def gallery_videos():
    """List generated videos."""
    videos = sorted(
        Path("storage/videos").glob("*.*"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return {
        "videos": [
            {
                "name": p.name,
                "url": f"/storage/videos/{p.name}",
                "size": p.stat().st_size,
                "created": p.stat().st_mtime,
            }
            for p in videos
            if p.suffix.lower() in (".mp4", ".gif", ".webm")
            and not p.name.startswith("src_")
        ]
    }


@app.get("/gallery/audio")
async def gallery_audio():
    """List generated audio/music."""
    files = sorted(
        Path("storage/audio").glob("*.*"), key=lambda p: p.stat().st_mtime, reverse=True
    )
    return {
        "audio": [
            {
                "name": p.name,
                "url": f"/storage/audio/{p.name}",
                "size": p.stat().st_size,
                "created": p.stat().st_mtime,
            }
            for p in files
            if p.suffix.lower() in (".wav", ".mp3", ".ogg")
            and not p.name.startswith("src_")
        ]
    }


# ============================================================
# ERROR HANDLERS
# ============================================================


@app.exception_handler(HTTPException)
async def http_error(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(Exception)
async def server_error(request, exc):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


# --- Entry Point ---

if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "main:app", host=settings.HOST, port=settings.PORT, reload=settings.RELOAD
    )
