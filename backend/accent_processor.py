import os
import tempfile
from datetime import datetime
from pathlib import Path

import librosa
import parselmouth
import soundfile as sf

ACCENT_PARAMS = {
    "british": {"pitch": 1.5, "formant": 1.08, "speed": 0.95},
    "american": {"pitch": 0.0, "formant": 1.00, "speed": 1.00},
    "australian": {"pitch": 2.0, "formant": 1.05, "speed": 1.00},
    "indian": {"pitch": -1.0, "formant": 0.92, "speed": 1.05},
    "scottish": {"pitch": 0.8, "formant": 0.98, "speed": 0.97},
    "irish": {"pitch": 1.2, "formant": 1.03, "speed": 1.02},
}


class AccentProcessor:
    def convert_accent(self, audio_path: str, accent_name: str) -> str:
        params = ACCENT_PARAMS.get(accent_name.lower())
        if not params:
            raise ValueError(f"Unknown accent: {accent_name}")

        y, sr = librosa.load(audio_path, sr=22050, mono=True)

        if params["pitch"] != 0.0:
            y = librosa.effects.pitch_shift(y=y, sr=sr, n_steps=params["pitch"])

        if params["speed"] != 1.0:
            y = librosa.effects.time_stretch(y=y, rate=params["speed"])

        temp_dir = Path(tempfile.gettempdir()) / "tone_weaver"
        temp_dir.mkdir(exist_ok=True)
        stamp = datetime.now().strftime("%H%M%S%f")
        temp_path = temp_dir / f"temp_{accent_name}_{stamp}.wav"
        sf.write(str(temp_path), y, sr)

        try:
            snd = parselmouth.Sound(str(temp_path))
            if params["formant"] != 1.0:
                snd = snd.resample(int(sr * params["formant"]))
                snd = snd.resample(sr)

            if accent_name.lower() in {"australian", "irish"}:
                manipulation = parselmouth.praat.call(snd, "To Manipulation", 0.01, 75, 600)
                pitch_tier = parselmouth.praat.call(manipulation, "Extract pitch tier")
                duration = snd.duration
                start_rise = duration * 0.70
                parselmouth.praat.call(pitch_tier, "Add point", start_rise, 120)
                parselmouth.praat.call(pitch_tier, "Add point", duration, 160)
                parselmouth.praat.call([pitch_tier, manipulation], "Replace pitch tier")
                snd = parselmouth.praat.call(manipulation, "Get resynthesis (overlap-add)")

            output_path = temp_dir / f"processed_{accent_name}_{stamp}.wav"
            snd.save(str(output_path), "WAV")
            return str(output_path)
        finally:
            if temp_path.exists():
                try:
                    os.remove(str(temp_path))
                except OSError:
                    pass
