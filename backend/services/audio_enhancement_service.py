"""
Audio Enhancement Service
Improves audio quality through noise reduction, equalization, and normalization
"""

import numpy as np
import librosa
import soundfile as sf
from pathlib import Path
from typing import Optional, Tuple
import logging
import torch
from scipy import signal

logger = logging.getLogger(__name__)


class AudioEnhancementService:
    """Service for audio quality enhancement and processing"""

    def __init__(self, sr: int = 22050):
        """
        Initialize audio enhancement service

        Args:
            sr: Sample rate (default: 22050 Hz)
        """
        self.sr = sr
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"🎵 Audio Enhancement Service initialized on {self.device}")

    def enhance_audio(
        self,
        audio_path: str,
        reduce_noise: bool = True,
        normalize: bool = True,
        equalize: bool = False,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Enhance audio quality with multiple techniques

        Args:
            audio_path: Path to input audio file
            reduce_noise: Apply noise reduction
            normalize: Apply volume normalization
            equalize: Apply equalization
            output_path: Path for output audio (auto-generated if None)

        Returns:
            Path to enhanced audio file
        """
        try:
            logger.info(f"🔊 Enhancing audio: {Path(audio_path).name}")

            # Load audio
            y, sr = librosa.load(audio_path, sr=self.sr)
            logger.info(f"📊 Loaded: {len(y) / sr:.1f}s @ {sr}Hz")

            # Apply enhancements
            if reduce_noise:
                y = self._reduce_noise(y)
                logger.info("✅ Noise reduction applied")

            if normalize:
                y = self._normalize_audio(y)
                logger.info("✅ Normalization applied")

            if equalize:
                y = self._equalize_audio(y, sr)
                logger.info("✅ Equalization applied")

            # Save output
            if output_path is None:
                output_path = str(
                    Path(audio_path).parent / f"enhanced_{Path(audio_path).stem}.wav"
                )

            sf.write(output_path, y, sr)
            logger.info(f"💾 Enhanced audio saved: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"❌ Audio enhancement failed: {e}")
            raise

    def _reduce_noise(self, y: np.ndarray, noise_factor: float = 0.8) -> np.ndarray:
        """
        Reduce background noise using spectral subtraction

        Args:
            y: Audio signal
            noise_factor: Noise reduction strength (0-1)

        Returns:
            Noise-reduced audio signal
        """
        try:
            # Compute STFT
            D = librosa.stft(y)
            magnitude = np.abs(D)
            phase = np.angle(D)

            # Estimate noise from quietest frames
            noise_profile = np.median(
                magnitude[:, : min(50, magnitude.shape[1])], axis=1
            )

            # Spectral subtraction
            magnitude_reduced = magnitude - noise_factor * noise_profile[:, np.newaxis]
            magnitude_reduced = np.maximum(magnitude_reduced, 0.1 * magnitude)

            # Reconstruct
            D_reduced = magnitude_reduced * np.exp(1j * phase)
            y_reduced = librosa.istft(D_reduced)

            return y_reduced

        except Exception as e:
            logger.warning(f"⚠️  Noise reduction failed: {e}, returning original")
            return y

    def _normalize_audio(self, y: np.ndarray, target_db: float = -20.0) -> np.ndarray:
        """
        Normalize audio to target loudness

        Args:
            y: Audio signal
            target_db: Target loudness in dB

        Returns:
            Normalized audio signal
        """
        try:
            # Calculate current loudness
            rms = np.sqrt(np.mean(y**2))
            current_db = 20 * np.log10(rms + 1e-10)

            # Calculate gain
            gain_db = target_db - current_db
            gain_linear = 10 ** (gain_db / 20)

            # Apply gain with soft clipping
            y_normalized = y * gain_linear
            y_normalized = np.tanh(y_normalized)  # Soft clipping

            return y_normalized

        except Exception as e:
            logger.warning(f"⚠️  Normalization failed: {e}, returning original")
            return y

    def _equalize_audio(self, y: np.ndarray, sr: int) -> np.ndarray:
        """
        Apply equalization to enhance speech clarity

        Args:
            y: Audio signal
            sr: Sample rate

        Returns:
            Equalized audio signal
        """
        try:
            # Speech-focused EQ: boost mid frequencies
            # Design filters for speech enhancement
            nyquist = sr / 2

            # Boost 1-4 kHz (speech clarity)
            sos_boost = signal.butter(
                4, [1000 / nyquist, 4000 / nyquist], btype="band", output="sos"
            )
            y = signal.sosfilt(sos_boost, y) * 1.5

            # High-pass filter to remove rumble
            sos_hp = signal.butter(2, 80 / nyquist, btype="high", output="sos")
            y = signal.sosfilt(sos_hp, y)

            return y

        except Exception as e:
            logger.warning(f"⚠️  Equalization failed: {e}, returning original")
            return y

    def denoise_audio(self, audio_path: str, output_path: Optional[str] = None) -> str:
        """
        Advanced denoising using spectral gating

        Args:
            audio_path: Path to input audio
            output_path: Path for output audio

        Returns:
            Path to denoised audio file
        """
        try:
            logger.info(f"🔇 Denoising audio: {Path(audio_path).name}")

            y, sr = librosa.load(audio_path, sr=self.sr)

            # Compute spectrogram
            D = librosa.stft(y)
            magnitude = np.abs(D)
            phase = np.angle(D)

            # Compute noise gate threshold (adaptive)
            threshold = np.percentile(magnitude, 20)

            # Apply soft gating
            gate = np.ones_like(magnitude)
            gate[magnitude < threshold] = 0.1

            # Smooth gate to avoid artifacts
            gate = np.maximum(gate, 0.1)

            # Apply gate
            magnitude_gated = magnitude * gate

            # Reconstruct
            D_gated = magnitude_gated * np.exp(1j * phase)
            y_denoised = librosa.istft(D_gated)

            # Save
            if output_path is None:
                output_path = str(
                    Path(audio_path).parent / f"denoised_{Path(audio_path).stem}.wav"
                )

            sf.write(output_path, y_denoised, sr)
            logger.info(f"💾 Denoised audio saved: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"❌ Denoising failed: {e}")
            raise

    def compress_audio(
        self, audio_path: str, ratio: float = 4.0, output_path: Optional[str] = None
    ) -> str:
        """
        Apply dynamic range compression

        Args:
            audio_path: Path to input audio
            ratio: Compression ratio (4.0 = 4:1)
            output_path: Path for output audio

        Returns:
            Path to compressed audio file
        """
        try:
            logger.info(f"📉 Compressing audio: {Path(audio_path).name}")

            y, sr = librosa.load(audio_path, sr=self.sr)

            # Simple compressor
            threshold = 0.1
            y_compressed = y.copy()

            # Apply compression to samples above threshold
            mask = np.abs(y) > threshold
            y_compressed[mask] = np.sign(y[mask]) * (
                threshold + (np.abs(y[mask]) - threshold) / ratio
            )

            # Save
            if output_path is None:
                output_path = str(
                    Path(audio_path).parent / f"compressed_{Path(audio_path).stem}.wav"
                )

            sf.write(output_path, y_compressed, sr)
            logger.info(f"💾 Compressed audio saved: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"❌ Compression failed: {e}")
            raise

    def mix_audio(
        self,
        audio_paths: list,
        volumes: Optional[list] = None,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Mix multiple audio tracks

        Args:
            audio_paths: List of audio file paths
            volumes: List of volume levels (0-1) for each track
            output_path: Path for output audio

        Returns:
            Path to mixed audio file
        """
        try:
            logger.info(f"🎼 Mixing {len(audio_paths)} audio tracks")

            if volumes is None:
                volumes = [1.0] * len(audio_paths)

            # Load all audio files
            audio_data = []
            max_len = 0

            for path, vol in zip(audio_paths, volumes):
                y, sr = librosa.load(path, sr=self.sr)
                y = y * vol
                audio_data.append(y)
                max_len = max(max_len, len(y))

            # Pad to same length
            mixed = np.zeros(max_len)
            for y in audio_data:
                mixed[: len(y)] += y

            # Normalize to prevent clipping
            mixed = mixed / (np.max(np.abs(mixed)) + 1e-10)

            # Save
            if output_path is None:
                output_path = "mixed_audio.wav"

            sf.write(output_path, mixed, self.sr)
            logger.info(f"💾 Mixed audio saved: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"❌ Audio mixing failed: {e}")
            raise


# Singleton instance
_audio_enhancement_service = None


def get_audio_enhancement_service() -> AudioEnhancementService:
    """Get or create audio enhancement service singleton"""
    global _audio_enhancement_service
    if _audio_enhancement_service is None:
        _audio_enhancement_service = AudioEnhancementService()
    return _audio_enhancement_service
