"""
Avatar Lip-Sync Service

Synchronizes avatar mouth movements with audio for realistic speech animation.
Uses audio feature extraction and facial keypoint mapping for natural lip-sync.

Lip-Sync Pipeline:
1. Extract audio features (MFCC, spectral characteristics)
2. Map audio features to viseme (visual phoneme) classifications
3. Detect facial keypoints on avatar
4. Apply mouth deformation based on visemes
5. Blend transitions for smooth animation

Performance targets:
- Audio feature extraction: < 1 sec per minute of audio
- Viseme mapping: < 1 sec per minute of audio
- Frame generation: 20-30 FPS
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime
import json
import tempfile
from loguru import logger


# Configure logging
logger.enable("avatar_lipsync_service")


# Viseme definitions (visual phonemes)
# Maps phonemes to mouth shapes
@dataclass
class Viseme:
    """Visual phoneme representation"""

    id: int
    name: str
    description: str
    phonemes: List[str]  # Associated phonemes
    mouth_shape: str  # e.g., "closed", "open", "rounded"


VISEMES = [
    Viseme(0, "A", "Open mouth", ["a", "aː"], "wide_open"),
    Viseme(1, "E", "Smile", ["e", "eː"], "smile"),
    Viseme(2, "I", "Narrow smile", ["i", "iː"], "narrow_smile"),
    Viseme(3, "O", "Round mouth", ["o", "oː"], "round"),
    Viseme(4, "U", "Lips rounded", ["u", "uː"], "round_puckered"),
    Viseme(5, "M", "Lips closed", ["m", "b", "p"], "closed_lips"),
    Viseme(6, "N", "Tongue at roof", ["n", "ng"], "neutral"),
    Viseme(7, "S", "Teeth together", ["s", "z"], "teeth_closed"),
    Viseme(8, "T", "Teeth clenched", ["t", "d"], "teeth_clenched"),
    Viseme(9, "FF", "Lower lips", ["f", "v"], "lower_prominent"),
    Viseme(10, "Rest", "Neutral", ["silence"], "neutral"),
]

# Viseme to mouth deformation mapping
VISEME_DEFORMATIONS = {
    "wide_open": {"mouth_open": 0.8, "jaw_drop": 0.7, "lip_stretch": 0.2},
    "smile": {"mouth_open": 0.2, "jaw_drop": 0.1, "lip_stretch": 0.9},
    "narrow_smile": {"mouth_open": 0.15, "jaw_drop": 0.05, "lip_stretch": 0.7},
    "round": {"mouth_open": 0.6, "jaw_drop": 0.4, "lip_pucker": 0.8},
    "round_puckered": {"mouth_open": 0.3, "jaw_drop": 0.2, "lip_pucker": 0.9},
    "closed_lips": {"mouth_open": 0.0, "jaw_drop": 0.0, "lip_pucker": 0.3},
    "neutral": {"mouth_open": 0.05, "jaw_drop": 0.02, "lip_stretch": 0.1},
    "teeth_closed": {"mouth_open": 0.1, "jaw_drop": 0.05, "lip_stretch": 0.3},
    "teeth_clenched": {"mouth_open": 0.0, "jaw_drop": 0.0, "lip_stretch": 0.2},
    "lower_prominent": {"mouth_open": 0.2, "jaw_drop": 0.1, "lower_lip_out": 0.6},
}


@dataclass
class AudioFeatures:
    """Extracted audio features for lip-sync"""

    mfcc: np.ndarray  # Mel Frequency Cepstral Coefficients
    mel_spectrogram: np.ndarray  # Mel-scale spectrogram
    spectral_centroid: np.ndarray  # Spectral properties
    energy: np.ndarray  # Energy per frame
    zero_crossing_rate: np.ndarray  # Voice activity indicator
    sample_rate: int
    hop_length: int
    frames_per_second: float


@dataclass
class LipSyncFrame:
    """Single frame of lip-sync animation"""

    frame_idx: int
    timestamp: float  # Seconds from start
    viseme: Viseme  # Current viseme
    deformation: Dict[str, float]  # Mouth deformation parameters
    confidence: float  # Confidence in viseme classification (0-1)
    transition: float  # Blend factor for smooth transition (0-1)


class AudioFeatureExtractor:
    """Extract features from audio for lip-sync"""

    def __init__(self, sample_rate: int = 16000, n_mfcc: int = 13):
        """
        Initialize audio feature extractor.

        Args:
            sample_rate: Sample rate of audio (Hz)
            n_mfcc: Number of MFCC coefficients
        """
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc
        self.hop_length = 512  # samples per frame

    def extract_features(self, audio_path: str) -> AudioFeatures:
        """
        Extract features from audio file.

        Args:
            audio_path: Path to audio file (WAV, MP3)

        Returns:
            AudioFeatures instance
        """
        try:
            import librosa

            logger.info(f"🎵 Extracting audio features from {Path(audio_path).name}")

            # Load audio
            y, sr = librosa.load(audio_path, sr=self.sample_rate)

            # Extract features
            mfcc = librosa.feature.mfcc(
                y=y, sr=sr, n_mfcc=self.n_mfcc, hop_length=self.hop_length
            )
            mel_spec = librosa.feature.melspectrogram(
                y=y, sr=sr, hop_length=self.hop_length
            )
            spectral_centroid = librosa.feature.spectral_centroid(
                y=y, sr=sr, hop_length=self.hop_length
            )
            energy = np.sqrt(np.sum(mel_spec**2, axis=0))
            zero_crossing = librosa.feature.zero_crossing_rate(
                y=y, hop_length=self.hop_length
            )[0]

            fps = sr / self.hop_length

            features = AudioFeatures(
                mfcc=mfcc,
                mel_spectrogram=mel_spec,
                spectral_centroid=spectral_centroid,
                energy=energy,
                zero_crossing_rate=zero_crossing,
                sample_rate=sr,
                hop_length=self.hop_length,
                frames_per_second=fps,
            )

            logger.info(f"✅ Extracted {mfcc.shape[1]} audio frames @ {fps:.1f} FPS")
            return features

        except Exception as e:
            logger.error(f"❌ Failed to extract audio features: {e}")
            raise

    def extract_features_bytes(self, audio_bytes: bytes) -> AudioFeatures:
        """
        Extract features from audio bytes.

        Args:
            audio_bytes: Raw audio data

        Returns:
            AudioFeatures instance
        """
        try:
            import librosa
            import io

            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            try:
                features = self.extract_features(temp_path)
            finally:
                import os

                os.unlink(temp_path)

            return features

        except Exception as e:
            logger.error(f"❌ Failed to extract features from bytes: {e}")
            raise


class VisemeClassifier:
    """Classify audio frames to visemes for lip-sync"""

    def __init__(self):
        """Initialize viseme classifier"""
        self.features_dim = 13 + 128  # MFCC + Mel bins (for simple classification)

    def classify_frame(
        self, audio_features: AudioFeatures, frame_idx: int
    ) -> Tuple[Viseme, float]:
        """
        Classify a single audio frame to a viseme.

        Args:
            audio_features: Extracted audio features
            frame_idx: Index of frame to classify

        Returns:
            Tuple of (viseme, confidence)
        """
        try:
            # Extract features for this frame
            mfcc_frame = audio_features.mfcc[:, frame_idx]
            energy = audio_features.energy[frame_idx]
            zcr = audio_features.zero_crossing_rate[frame_idx]

            # Simple classification based on audio characteristics
            # In production, use ML model for better accuracy

            # Normalize features
            mfcc_norm = np.linalg.norm(mfcc_frame)
            energy_norm = energy / (np.max(audio_features.energy) + 1e-6)

            # Classify based on energy and MFCC patterns
            if energy_norm < 0.1:
                # Silence or very quiet
                return VISEMES[10], 0.9  # Rest/silence

            # Mid-range energy
            if zcr > 0.1:
                # Voiceless sounds (S, T, F)
                return VISEMES[7], 0.7  # S

            # Use spectral centroid for classification
            centroid = np.mean(audio_features.spectral_centroid[:, frame_idx])

            if centroid < 2000:
                return VISEMES[5], 0.6  # M (closed lips)
            elif centroid < 3000:
                return VISEMES[0], 0.6  # A (open)
            elif centroid < 4000:
                return VISEMES[1], 0.6  # E (smile)
            else:
                return VISEMES[3], 0.6  # O (round)

        except Exception as e:
            logger.error(f"❌ Failed to classify frame: {e}")
            return VISEMES[10], 0.3  # Default to rest

    def classify_sequence(
        self, audio_features: AudioFeatures
    ) -> List[Tuple[Viseme, float]]:
        """
        Classify entire audio sequence to visemes.

        Args:
            audio_features: Extracted audio features

        Returns:
            List of (viseme, confidence) tuples
        """
        n_frames = audio_features.mfcc.shape[1]
        viseme_sequence = []

        for frame_idx in range(n_frames):
            viseme, confidence = self.classify_frame(audio_features, frame_idx)
            viseme_sequence.append((viseme, confidence))

        logger.info(f"✅ Classified {n_frames} frames to visemes")
        return viseme_sequence


class LipSyncGenerator:
    """Generate lip-sync animation frames"""

    def __init__(self, animation_fps: int = 30):
        """
        Initialize lip-sync generator.

        Args:
            animation_fps: Frame rate for animation
        """
        self.animation_fps = animation_fps
        self.classifier = VisemeClassifier()
        self.extractor = AudioFeatureExtractor()

    def generate_lipsync(self, audio_path: str) -> List[LipSyncFrame]:
        """
        Generate lip-sync frames for audio.

        Args:
            audio_path: Path to audio file

        Returns:
            List of LipSyncFrame objects
        """
        try:
            logger.info(f"🎬 Generating lip-sync for {Path(audio_path).name}")

            # Extract audio features
            audio_features = self.extractor.extract_features(audio_path)

            # Classify to visemes
            viseme_sequence = self.classifier.classify_sequence(audio_features)

            # Generate frames with smooth transitions
            lipsync_frames = self._apply_smoothing_transitions(
                viseme_sequence, audio_features
            )

            logger.info(f"✅ Generated {len(lipsync_frames)} lip-sync frames")
            return lipsync_frames

        except Exception as e:
            logger.error(f"❌ Failed to generate lip-sync: {e}")
            raise

    def _apply_smoothing_transitions(
        self, viseme_sequence: List[Tuple[Viseme, float]], audio_features: AudioFeatures
    ) -> List[LipSyncFrame]:
        """
        Apply smoothing and transitions between visemes.

        Args:
            viseme_sequence: List of (viseme, confidence) tuples
            audio_features: Audio features

        Returns:
            List of LipSyncFrame with smooth transitions
        """
        lipsync_frames = []
        n_frames = len(viseme_sequence)

        # Apply smoothing filter to viseme sequence
        window_size = 3
        smoothed_visemes = []

        for i in range(n_frames):
            # Look at surrounding frames
            start = max(0, i - window_size // 2)
            end = min(n_frames, i + window_size // 2 + 1)
            nearby_visemes = [v[0] for v in viseme_sequence[start:end]]

            # Most common viseme in window
            viseme_counts = {}
            for v in nearby_visemes:
                viseme_counts[v.id] = viseme_counts.get(v.id, 0) + 1

            main_viseme_id = max(viseme_counts, key=viseme_counts.get)
            main_viseme = next((v for v in VISEMES if v.id == main_viseme_id))

            smoothed_visemes.append((main_viseme, viseme_sequence[i][1]))

        # Generate frames
        for frame_idx, (viseme, confidence) in enumerate(smoothed_visemes):
            timestamp = frame_idx / audio_features.frames_per_second

            # Get deformation for this viseme
            deformation = VISEME_DEFORMATIONS.get(
                viseme.mouth_shape, VISEME_DEFORMATIONS["neutral"]
            ).copy()

            # Apply confidence scaling
            for key in deformation:
                deformation[key] *= confidence

            # Calculate transition factor (smoother)
            if frame_idx > 0:
                prev_viseme = smoothed_visemes[frame_idx - 1][0]
                if prev_viseme.id == viseme.id:
                    transition = 0.0  # No transition
                else:
                    transition = min(0.5, (frame_idx % 5) / 5)  # Smooth blend
            else:
                transition = 0.0

            lipsync_frame = LipSyncFrame(
                frame_idx=frame_idx,
                timestamp=timestamp,
                viseme=viseme,
                deformation=deformation,
                confidence=confidence,
                transition=transition,
            )

            lipsync_frames.append(lipsync_frame)

        return lipsync_frames

    def export_lipsync_data(
        self, lipsync_frames: List[LipSyncFrame], output_path: str
    ) -> str:
        """
        Export lip-sync data to JSON format.

        Args:
            lipsync_frames: List of lip-sync frames
            output_path: Path to save JSON

        Returns:
            Path to saved file
        """
        try:
            data = {
                "num_frames": len(lipsync_frames),
                "fps": self.animation_fps,
                "frames": [
                    {
                        "frame_idx": f.frame_idx,
                        "timestamp": f.timestamp,
                        "viseme": f.viseme.name,
                        "viseme_id": f.viseme.id,
                        "deformation": f.deformation,
                        "confidence": float(f.confidence),
                        "transition": float(f.transition),
                    }
                    for f in lipsync_frames
                ],
            }

            with open(output_path, "w") as f:
                json.dump(data, f, indent=2)

            logger.info(f"💾 Lip-sync data exported: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"❌ Failed to export lip-sync data: {e}")
            raise

    def load_lipsync_data(self, json_path: str) -> List[LipSyncFrame]:
        """
        Load lip-sync data from JSON.

        Args:
            json_path: Path to JSON file

        Returns:
            List of LipSyncFrame objects
        """
        try:
            with open(json_path, "r") as f:
                data = json.load(f)

            lipsync_frames = []

            for frame_data in data["frames"]:
                viseme = next(
                    (v for v in VISEMES if v.id == frame_data["viseme_id"]),
                    VISEMES[10],
                )

                lipsync_frame = LipSyncFrame(
                    frame_idx=frame_data["frame_idx"],
                    timestamp=frame_data["timestamp"],
                    viseme=viseme,
                    deformation=frame_data["deformation"],
                    confidence=frame_data["confidence"],
                    transition=frame_data["transition"],
                )

                lipsync_frames.append(lipsync_frame)

            logger.info(f"💾 Loaded {len(lipsync_frames)} lip-sync frames")
            return lipsync_frames

        except Exception as e:
            logger.error(f"❌ Failed to load lip-sync data: {e}")
            raise


# Singleton management
_lipsync_generator = None


def get_lipsync_generator(animation_fps: int = 30) -> LipSyncGenerator:
    """
    Get or create singleton LipSyncGenerator instance.

    Args:
        animation_fps: Animation frame rate

    Returns:
        LipSyncGenerator instance
    """
    global _lipsync_generator

    if _lipsync_generator is None:
        _lipsync_generator = LipSyncGenerator(animation_fps=animation_fps)

    return _lipsync_generator
