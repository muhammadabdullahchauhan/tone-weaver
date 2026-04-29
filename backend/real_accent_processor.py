import tempfile
from datetime import datetime
from pathlib import Path

import edge_tts
import librosa
import numpy as np
import speech_recognition as sr

VOICE_MAP = {
    "american": {"female": "en-US-JennyNeural", "male": "en-US-GuyNeural"},
    "british": {"female": "en-GB-SoniaNeural", "male": "en-GB-RyanNeural"},
    "irish": {"female": "en-IE-EmilyNeural", "male": "en-IE-ConnorNeural"},
    "australian": {"female": "en-AU-NatashaNeural", "male": "en-AU-WilliamNeural"},
    "indian": {"female": "en-IN-NeerjaNeural", "male": "en-IN-PrabhatNeural"},
    "scottish": {"female": "en-GB-SoniaNeural", "male": "en-GB-RyanNeural"},
}

CELEBRITY_GENDER = {
    "david-attenborough": "male",
    "morgan-freeman": "male",
    "judi-dench": "female",
    "chris-hemsworth": "male",
    "cate-blanchett": "female",
    "benedict-cumberbatch": "male",
    "priyanka-chopra": "female",
    "idris-elba": "male",
}


class RealAccentProcessor:
    def __init__(self) -> None:
        self._recognizer = sr.Recognizer()

    async def convert_accent(
        self,
        wav_path: str,
        accent_name: str,
        celebrity_id: str | None = None,
        voice_type: str | None = None,
    ) -> str:
        accent_key = accent_name.lower().strip()
        voice_set = VOICE_MAP.get(accent_key)
        if not voice_set:
            raise ValueError(f"Unsupported accent for real conversion: {accent_name}")

        normalized_voice_type = (voice_type or "").strip().lower()
        if normalized_voice_type and normalized_voice_type not in {"male", "female"}:
            raise ValueError("voice_type must be either 'male' or 'female'.")

        normalized_celebrity = (celebrity_id or "").strip().lower()
        forced_gender = CELEBRITY_GENDER.get(normalized_celebrity)
        if normalized_voice_type in {"male", "female"}:
            voice = voice_set[normalized_voice_type]
        elif forced_gender in {"male", "female"}:
            voice = voice_set[forced_gender]
        else:
            detected_gender = self._detect_gender(wav_path)
            voice = voice_set["female"] if detected_gender == "female" else voice_set["male"]

        text = self._speech_to_text(wav_path)
        if not text:
            raise ValueError("Could not transcribe speech from audio.")

        return await self._text_to_speech(text, voice, accent_key)

    def _detect_gender(self, wav_path: str) -> str:
        y, sr = librosa.load(wav_path, sr=22050, mono=True)
        if y.size == 0:
            return "female"

        pitches = librosa.yin(y, fmin=65, fmax=400, sr=sr)
        valid = pitches[np.isfinite(pitches)]
        if valid.size == 0:
            return "female"

        median_f0 = float(np.median(valid))
        return "male" if median_f0 < 165.0 else "female"

    def _speech_to_text(self, wav_path: str) -> str:
        with sr.AudioFile(wav_path) as source:
            audio_data = self._recognizer.record(source)
        try:
            return self._recognizer.recognize_google(audio_data).strip()
        except sr.UnknownValueError as exc:
            raise ValueError("Speech was unclear. Please record again.") from exc
        except sr.RequestError as exc:
            raise RuntimeError(
                "STT service unavailable. Check internet connection and try again."
            ) from exc

    async def _text_to_speech(self, text: str, voice: str, accent_key: str) -> str:
        temp_dir = Path(tempfile.gettempdir()) / "tone_weaver"
        temp_dir.mkdir(exist_ok=True)
        output_path = temp_dir / f"real_{accent_key}_{datetime.now().strftime('%H%M%S%f')}.wav"

        communicate = edge_tts.Communicate(text=text, voice=voice, rate="+0%")
        await communicate.save(str(output_path))
        return str(output_path)
