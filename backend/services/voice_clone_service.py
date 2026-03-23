"""
Voice Cloning Service using GPT-SoVITS

Trains on user's voice samples and can synthesize speech in their voice.
"""

import logging
import numpy as np
from pathlib import Path
from typing import List, Optional
import pickle
from datetime import datetime

logger = logging.getLogger(__name__)


class VoiceProfile:
    """Represents a trained voice profile"""

    def __init__(self, user_id: str, voice_name: str = "default"):
        self.id = None  # Set by database
        self.user_id = user_id
        self.voice_name = voice_name
        self.speaker_embedding = None  # Voice characteristics (numpy array)
        self.sample_rate = 16000
        self.trained_at = None
        self.num_samples = 0
        self.model_path = None

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "voice_name": self.voice_name,
            "sample_rate": self.sample_rate,
            "trained_at": self.trained_at,
            "num_samples": self.num_samples,
        }


class VoiceCloningService:
    """Voice cloning service using GPT-SoVITS"""

    def __init__(self, models_dir: str = "models/voice_clones"):
        """
        Initialize voice cloning service

        Args:
            models_dir: Directory to store trained voice models
        """
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Voice cloning service initialized. Models dir: {self.models_dir}")

        # In production, would load GPT-SoVITS model here
        # For now, we implement the interface
        self.base_model = None
        self._load_base_model()

    def _load_base_model(self):
        """Load pre-trained GPT-SoVITS model"""
        try:
            logger.info("Loading base GPT-SoVITS model...")
            # TODO: Load actual model from HuggingFace or local path
            # For MVP, we'll simulate this
            self.base_model = {"status": "loaded"}
            logger.info("✅ Base model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load base model: {e}")
            # Continue anyway - will fail on train/synthesis

    def extract_speaker_characteristics(
        self, audio_path: str, sample_rate: int = 16000
    ) -> np.ndarray:
        """
        Extract speaker characteristics from audio file

        Returns speaker embedding (vector representation of voice)

        Args:
            audio_path: Path to audio file
            sample_rate: Expected sample rate

        Returns:
            Speaker embedding (numpy array)
        """
        try:
            logger.info(f"Extracting speaker characteristics from: {audio_path}")

            # In production: Use pre-trained speaker encoder
            # For MVP: Create dummy embedding
            # Shape: (256,) - typical speaker embedding dimension
            embedding = np.random.randn(256).astype(np.float32)

            logger.info(f"✅ Speaker embedding extracted: shape={embedding.shape}")
            return embedding
        except Exception as e:
            logger.error(f"❌ Failed to extract characteristics: {e}")
            raise

    def train_on_samples(
        self, audio_samples: List[str], user_id: str, voice_name: str = "default"
    ) -> VoiceProfile:
        """
        Train/adapt voice model on user's samples

        This is a pseudo-synchronous operation for MVP.
        In production, would use async task queue (Celery).

        Args:
            audio_samples: List of paths to audio files (WAV, MP3, etc.)
            user_id: User identifier
            voice_name: Name for this voice profile

        Returns:
            VoiceProfile with trained characteristics

        Raises:
            ValueError: If sample count < 3 or files don't exist
        """
        try:
            if len(audio_samples) < 3:
                raise ValueError(f"Need at least 3 samples, got {len(audio_samples)}")

            # Verify files exist
            for sample_path in audio_samples:
                if not Path(sample_path).exists():
                    raise FileNotFoundError(f"Sample not found: {sample_path}")

            logger.info(
                f"Training voice on {len(audio_samples)} samples for user {user_id}"
            )

            # Extract characteristics from each sample
            embeddings = []
            for sample_path in audio_samples:
                embedding = self.extract_speaker_characteristics(sample_path)
                embeddings.append(embedding)

            # Average embeddings to create voice profile
            average_embedding = np.mean(embeddings, axis=0)

            # Create voice profile
            voice_profile = VoiceProfile(user_id, voice_name)
            voice_profile.speaker_embedding = average_embedding
            voice_profile.trained_at = datetime.utcnow().isoformat()
            voice_profile.num_samples = len(audio_samples)
            voice_profile.model_path = self._save_voice_model(voice_profile)

            logger.info(
                f"✅ Voice training complete. Profile saved to: {voice_profile.model_path}"
            )

            return voice_profile
        except Exception as e:
            logger.error(f"❌ Voice training failed: {e}")
            raise

    def _save_voice_model(self, voice_profile: VoiceProfile) -> str:
        """Save trained voice model to disk"""
        try:
            model_path = (
                self.models_dir
                / f"{voice_profile.user_id}_{voice_profile.voice_name}_{datetime.now().timestamp()}.pkl"
            )

            with open(model_path, "wb") as f:
                pickle.dump(voice_profile, f)

            logger.info(f"Voice model saved: {model_path}")
            return str(model_path)
        except Exception as e:
            logger.error(f"Failed to save voice model: {e}")
            raise

    def load_voice_profile(self, model_path: str) -> VoiceProfile:
        """Load trained voice profile from disk"""
        try:
            if not Path(model_path).exists():
                raise FileNotFoundError(f"Model not found: {model_path}")

            with open(model_path, "rb") as f:
                voice_profile = pickle.load(f)

            logger.info(f"Voice profile loaded: {voice_profile.voice_name}")
            return voice_profile
        except Exception as e:
            logger.error(f"Failed to load voice profile: {e}")
            raise

    def synthesize(
        self, text: str, voice_profile: VoiceProfile, language: str = "en"
    ) -> bytes:
        """
        Synthesize speech with cloned voice

        Args:
            text: Text to synthesize
            voice_profile: Trained voice profile
            language: Language code

        Returns:
            Audio bytes (16kHz mono WAV)
        """
        try:
            if voice_profile.speaker_embedding is None:
                raise ValueError("Voice profile not properly trained")

            logger.info(
                f"Synthesizing: '{text[:50]}...' with voice: {voice_profile.voice_name}"
            )

            # In production:
            # 1. Text -> phonemes
            # 2. Phonemes + speaker_embedding -> mel-spectrogram
            # 3. Mel-spectrogram -> waveform (using vocoder like HiFi-GAN)

            # For MVP: Create dummy audio
            duration_seconds = len(text) / 15  # Rough estimate
            sample_rate = 16000
            num_samples = int(duration_seconds * sample_rate)

            # Generate random audio (would be real speech in production)
            audio = np.random.randn(num_samples).astype(np.float32) * 0.1

            # Convert to WAV bytes
            import io
            import wave

            with io.BytesIO() as wav_buffer:
                with wave.open(wav_buffer, "wb") as wav_file:
                    wav_file.setnchannels(1)  # Mono
                    wav_file.setsampwidth(2)  # 16-bit
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes((audio * 32767).astype(np.int16).tobytes())

                wav_bytes = wav_buffer.getvalue()

            logger.info(f"✅ Synthesis complete: {len(wav_bytes)} bytes")
            return wav_bytes
        except Exception as e:
            logger.error(f"❌ Synthesis failed: {e}")
            raise

    def get_voice_profiles(self, user_id: str) -> List[dict]:
        """Get all voice profiles for a user"""
        try:
            profiles = []
            for model_file in self.models_dir.glob(f"{user_id}_*.pkl"):
                profile = self.load_voice_profile(str(model_file))
                profiles.append(profile.to_dict())

            logger.info(f"Found {len(profiles)} profiles for user {user_id}")
            return profiles
        except Exception as e:
            logger.error(f"Failed to get voice profiles: {e}")
            return []

    def delete_voice_profile(self, model_path: str) -> bool:
        """Delete a voice profile"""
        try:
            Path(model_path).unlink()
            logger.info(f"✅ Voice profile deleted: {model_path}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to delete voice profile: {e}")
            return False


# Singleton instance
_voice_cloning_service = None


def get_voice_cloning_service() -> VoiceCloningService:
    """Get or create voice cloning service singleton"""
    global _voice_cloning_service
    if _voice_cloning_service is None:
        _voice_cloning_service = VoiceCloningService()
    return _voice_cloning_service
