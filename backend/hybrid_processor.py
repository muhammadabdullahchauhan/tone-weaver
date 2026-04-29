import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

import librosa
import numpy as np
import soundfile as sf

class HybridProcessor:
    def __init__(self, real_accent_processor: Any) -> None:
        self._real_accent_processor = real_accent_processor

    async def create_hybrid(
        self,
        audio_path: str,
        accent1: str,
        accent2: str,
        mix_percentage: int,
        voice_type: str | None = None,
        celebrity_id: str | None = None,
    ) -> str:
        accent1 = accent1.lower().strip()
        accent2 = accent2.lower().strip()
        ratio1 = mix_percentage / 100.0

        accent1_path = await self._real_accent_processor.convert_accent(
            audio_path, accent1, celebrity_id=celebrity_id, voice_type=voice_type
        )
        accent2_path = await self._real_accent_processor.convert_accent(
            audio_path, accent2, celebrity_id=celebrity_id, voice_type=voice_type
        )

        temp_dir = Path(tempfile.gettempdir()) / "tone_weaver"
        temp_dir.mkdir(exist_ok=True)
        stamp = datetime.now().strftime("%H%M%S%f")

        try:
            y1, sr1 = librosa.load(accent1_path, sr=22050, mono=True)
            y2, sr2 = librosa.load(accent2_path, sr=22050, mono=True)
            if sr1 != sr2:
                raise ValueError("Converted accent streams have mismatched sample rates.")

            length = min(len(y1), len(y2))
            if length == 0:
                raise ValueError("Converted accent streams are empty.")

            y1 = y1[:length]
            y2 = y2[:length]

            # Timeline hybrid: first N% from accent1, remaining from accent2.
            split_index = int(length * ratio1)
            split_index = max(0, min(length, split_index))

            if split_index == 0:
                hybrid = y2.copy()
            elif split_index == length:
                hybrid = y1.copy()
            else:
                hybrid = y1.copy()
                hybrid[split_index:] = y2[split_index:]

                # Add a short crossfade around the boundary to avoid an abrupt seam.
                crossfade = min(int(sr1 * 0.04), split_index, length - split_index)
                if crossfade > 1:
                    start = split_index - crossfade
                    end = split_index + crossfade
                    fade_len = end - start
                    fade_out = np.linspace(1.0, 0.0, fade_len, dtype=np.float32)
                    fade_in = np.linspace(0.0, 1.0, fade_len, dtype=np.float32)
                    hybrid[start:end] = (y1[start:end] * fade_out) + (
                        y2[start:end] * fade_in
                    )

            output_path = temp_dir / f"hybrid_{accent1}_{accent2}_{stamp}.wav"
            sf.write(str(output_path), hybrid, sr1)
            return str(output_path)
        finally:
            for temp_path in (accent1_path, accent2_path):
                try:
                    if temp_path and os.path.exists(str(temp_path)):
                        os.remove(str(temp_path))
                except OSError:
                    pass
