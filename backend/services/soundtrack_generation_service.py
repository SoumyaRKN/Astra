"""
Soundtrack Generation Service
Generates background music and soundtracks from text descriptions and mood parameters
"""

import numpy as np
import soundfile as sf
from pathlib import Path
from typing import Optional, Dict, List
import logging
import torch
from scipy import signal

logger = logging.getLogger(__name__)


class SoundtrackGenerationService:
    """Service for generating background music and soundtracks"""

    # Mood definitions with corresponding parameters
    MOODS = {
        "happy": {"bpm": 120, "key": "major", "instruments": ["piano", "strings"]},
        "sad": {"bpm": 60, "key": "minor", "instruments": ["violin", "cello"]},
        "energetic": {
            "bpm": 140,
            "key": "major",
            "instruments": ["drums", "electric_guitar"],
        },
        "calm": {"bpm": 80, "key": "major", "instruments": ["ambient", "pad"]},
        "dramatic": {
            "bpm": 100,
            "key": "minor",
            "instruments": ["strings", "timpani"],
        },
        "cinematic": {
            "bpm": 90,
            "key": "major",
            "instruments": ["orchestra", "horn"],
        },
        "lo-fi": {
            "bpm": 85,
            "key": "minor",
            "instruments": ["sampler", "drums"],
        },
        "electronic": {
            "bpm": 128,
            "key": "major",
            "instruments": ["synth", "bass"],
        },
    }

    def __init__(self, sr: int = 22050):
        """
        Initialize soundtrack generation service

        Args:
            sr: Sample rate (default: 22050 Hz)
        """
        self.sr = sr
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"🎵 Soundtrack Generation Service initialized on {self.device}")

    def generate_soundtrack(
        self,
        description: str,
        duration: float = 30.0,
        mood: str = "calm",
        bpm: Optional[int] = None,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate background music from description

        Args:
            description: Music description (e.g., "relaxing ambient music")
            duration: Duration in seconds
            mood: Mood type (from MOODS dict)
            bpm: Override BPM
            output_path: Path for output audio

        Returns:
            Path to generated music file
        """
        try:
            logger.info(f"🎼 Generating {duration}s soundtrack: {description} ({mood})")

            # Get mood parameters
            mood_params = self.MOODS.get(mood, self.MOODS["calm"])
            bpm = bpm or mood_params["bpm"]

            logger.info(
                f"📊 BPM: {bpm}, Mood: {mood}, Instruments: {mood_params['instruments']}"
            )

            # Generate procedural music
            audio = self._generate_procedural_music(description, duration, bpm, mood)

            # Save
            if output_path is None:
                output_path = f"soundtrack_{mood}_{duration}s.wav"

            sf.write(output_path, audio, self.sr)
            logger.info(f"💾 Soundtrack saved: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"❌ Soundtrack generation failed: {e}")
            raise

    def _generate_procedural_music(
        self, description: str, duration: float, bpm: int, mood: str
    ) -> np.ndarray:
        """
        Generate procedural music using synthesis

        Args:
            description: Music description
            duration: Duration in seconds
            bpm: Beats per minute
            mood: Mood type

        Returns:
            Generated audio signal
        """
        try:
            num_samples = int(duration * self.sr)
            audio = np.zeros(num_samples)

            # Calculate beat duration
            beat_duration = 60.0 / bpm
            beat_samples = int(beat_duration * self.sr)

            # Generate base rhythm
            rhythm = self._generate_rhythm(num_samples, beat_samples, mood)

            # Generate melodic elements
            melody = self._generate_melody(num_samples, beat_samples, mood, description)

            # Generate harmonies
            harmony = self._generate_harmony(num_samples, beat_samples, mood)

            # Combine layers
            audio = rhythm * 0.4 + melody * 0.4 + harmony * 0.2

            # Normalize
            audio = audio / (np.max(np.abs(audio)) + 1e-10)

            # Add envelope to avoid clicks
            envelope = self._generate_envelope(num_samples)
            audio = audio * envelope

            return audio

        except Exception as e:
            logger.warning(f"⚠️  Procedural generation failed: {e}")
            # Return silence as fallback
            return np.zeros(int(duration * self.sr))

    def _generate_rhythm(
        self, num_samples: int, beat_samples: int, mood: str
    ) -> np.ndarray:
        """Generate drum/percussion rhythm"""
        rhythm = np.zeros(num_samples)

        # Determine drum pattern based on mood
        if mood in ["energetic", "electronic"]:
            # 4/4 beat with kick on 1 and 3, snare on 2 and 4
            kick_pattern = [0, 0, 2, 0, 0, 2, 0, 0]
        elif mood in ["calm", "lo-fi"]:
            # Sparse pattern
            kick_pattern = [0, 0, 0, 0, 0, 0, 0, 0]
        else:
            # Standard pattern
            kick_pattern = [0, 0, 2, 0, 0, 2, 0, 0]

        # Place beats
        for i, pattern in enumerate(kick_pattern):
            if pattern > 0:
                sample_pos = int(i * beat_samples / 2)
                if sample_pos < num_samples:
                    # Create kick drum sound (sine wave)
                    kick_freq = 60 if pattern == 2 else 80
                    kick_len = int(0.1 * self.sr)
                    if sample_pos + kick_len <= num_samples:
                        t = np.arange(kick_len) / self.sr
                        kick = np.sin(2 * np.pi * kick_freq * t)
                        kick *= np.exp(-5 * t)  # Decay
                        rhythm[sample_pos : sample_pos + kick_len] += kick

        return rhythm

    def _generate_melody(
        self, num_samples: int, beat_samples: int, mood: str, description: str
    ) -> np.ndarray:
        """Generate melodic line"""
        melody = np.zeros(num_samples)

        # Determine scale based on mood
        if "minor" in self.MOODS[mood]["key"].lower():
            # Minor pentatonic
            scale_intervals = [0, 3, 5, 7, 10]  # Semitones
            root_freq = 220  # A3
        else:
            # Major pentatonic
            scale_intervals = [0, 2, 4, 7, 9]  # Semitones
            root_freq = 261.63  # C4

        # Generate melody notes
        note_duration = int(beat_samples / 2)

        current_sample = 0
        note_idx = 0

        while current_sample < num_samples:
            # Select note from scale
            scale_degree = (note_idx % len(scale_intervals)) + (
                note_idx // len(scale_intervals)
            ) * 12  # Octave jumps
            semitones = (scale_degree % 12) + (scale_degree // 12) * 12
            freq = root_freq * (2 ** (semitones / 12))

            # Limit frequency range
            if freq > 2000:
                freq = root_freq * (
                    2 ** (scale_intervals[note_idx % len(scale_intervals)] / 12)
                )

            # Generate note
            if current_sample + note_duration <= num_samples:
                t = np.arange(note_duration) / self.sr
                note = np.sin(2 * np.pi * freq * t)

                # Add envelope
                note *= np.exp(-0.5 * t / (note_duration / self.sr))

                melody[current_sample : current_sample + note_duration] += note

            current_sample += note_duration
            note_idx += 1

        return melody

    def _generate_harmony(
        self, num_samples: int, beat_samples: int, mood: str
    ) -> np.ndarray:
        """Generate harmonic pad"""
        harmony = np.zeros(num_samples)

        # Determine base frequencies based on mood
        if "minor" in self.MOODS[mood]["key"].lower():
            base_freq = 110  # A2
        else:
            base_freq = 130.81  # C3

        # Generate harmonics (pad)
        harmonics = [1, 1.5, 2, 2.5]  # Harmonic series
        amplitudes = [0.3, 0.2, 0.15, 0.1]

        for harmonic, amplitude in zip(harmonics, amplitudes):
            freq = base_freq * harmonic
            t = np.arange(num_samples) / self.sr
            harmonic_signal = np.sin(2 * np.pi * freq * t) * amplitude

            # Low-pass filter the pad
            sos = signal.butter(4, 500 / (self.sr / 2), btype="low", output="sos")
            harmonic_signal = signal.sosfilt(sos, harmonic_signal)

            harmony += harmonic_signal

        return harmony

    def _generate_envelope(self, num_samples: int) -> np.ndarray:
        """Generate fade in/out envelope"""
        envelope = np.ones(num_samples)

        # Fade in (first 1 second)
        fade_in_samples = int(1.0 * self.sr)
        if fade_in_samples < num_samples:
            envelope[:fade_in_samples] = np.linspace(0, 1, fade_in_samples)

        # Fade out (last 1 second)
        fade_out_samples = int(1.0 * self.sr)
        if fade_out_samples < num_samples:
            envelope[-fade_out_samples:] = np.linspace(1, 0, fade_out_samples)

        return envelope

    def generate_ambient_soundtrack(
        self,
        scene_description: str,
        duration: float = 60.0,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Generate ambient music for video scenes

        Args:
            scene_description: Description of video scene
            duration: Duration in seconds
            output_path: Path for output audio

        Returns:
            Path to generated music
        """
        try:
            logger.info(f"🎬 Generating ambient soundtrack: {scene_description}")

            # Determine mood from description
            mood = self._infer_mood(scene_description)

            return self.generate_soundtrack(
                description=scene_description,
                duration=duration,
                mood=mood,
                output_path=output_path,
            )

        except Exception as e:
            logger.error(f"❌ Ambient soundtrack generation failed: {e}")
            raise

    def _infer_mood(self, description: str) -> str:
        """Infer mood from text description"""
        description_lower = description.lower()

        mood_keywords = {
            "happy": ["happy", "joy", "cheerful", "bright", "sunny"],
            "sad": ["sad", "melancholy", "dark", "gloomy", "lonely"],
            "energetic": ["energetic", "fast", "dynamic", "action", "intense"],
            "calm": ["calm", "peaceful", "relax", "gentle", "serene"],
            "dramatic": ["dramatic", "epic", "grand", "powerful"],
            "cinematic": ["cinematic", "movie", "film", "visual"],
            "lo-fi": ["lo-fi", "chilled", "chill", "hip-hop"],
            "electronic": ["electronic", "synth", "digital", "futuristic"],
        }

        for mood, keywords in mood_keywords.items():
            if any(kw in description_lower for kw in keywords):
                return mood

        return "calm"  # Default mood

    def create_soundtrack_collection(
        self,
        scenes: List[Dict],
        output_dir: Optional[str] = None,
    ) -> List[str]:
        """
        Generate soundtracks for multiple scenes

        Args:
            scenes: List of scene dicts with 'description' and 'duration'
            output_dir: Output directory for files

        Returns:
            List of generated audio paths
        """
        try:
            logger.info(f"🎼 Creating soundtrack collection for {len(scenes)} scenes")

            if output_dir is None:
                output_dir = "soundtracks"

            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)

            soundtracks = []

            for i, scene in enumerate(scenes):
                description = scene.get("description", "background music")
                duration = scene.get("duration", 30.0)

                output_path = output_dir / f"scene_{i:02d}_soundtrack.wav"

                soundtrack_path = self.generate_soundtrack(
                    description=description,
                    duration=duration,
                    output_path=str(output_path),
                )

                soundtracks.append(soundtrack_path)

            logger.info(f"✅ Generated {len(soundtracks)} soundtracks")

            return soundtracks

        except Exception as e:
            logger.error(f"❌ Soundtrack collection creation failed: {e}")
            raise


# Singleton instance
_soundtrack_generation_service = None


def get_soundtrack_generation_service() -> SoundtrackGenerationService:
    """Get or create soundtrack generation service singleton"""
    global _soundtrack_generation_service
    if _soundtrack_generation_service is None:
        _soundtrack_generation_service = SoundtrackGenerationService()
    return _soundtrack_generation_service
