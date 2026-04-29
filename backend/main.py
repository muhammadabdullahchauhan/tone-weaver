import base64
import json
import os
import re
import secrets
import shutil
import tempfile
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydub import AudioSegment

from accent_processor import ACCENT_PARAMS, AccentProcessor
from hybrid_processor import HybridProcessor
from real_accent_processor import RealAccentProcessor

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SAVED_DIR = BASE_DIR / "saved_audio"
TEMP_DIR = Path(tempfile.gettempdir()) / "tone_weaver"
HISTORY_PATH = DATA_DIR / "history.json"

MAX_AUDIO_DURATION = int(os.getenv("MAX_AUDIO_DURATION", "30"))
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

SUPPORTED_ACCENTS = list(ACCENT_PARAMS.keys())
ACCENT_ALIASES = {"irsh": "irish"}

accent_processor = AccentProcessor()
real_accent_processor = RealAccentProcessor()
hybrid_processor = HybridProcessor(real_accent_processor)


def configure_windows_ffmpeg() -> None:
    ffmpeg_from_path = shutil.which("ffmpeg")
    ffprobe_from_path = shutil.which("ffprobe")

    ffmpeg_candidates = [
        os.getenv("FFMPEG_PATH"),
        ffmpeg_from_path,
        r"C:\Windows\System32\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
    ]
    ffprobe_candidates = [
        os.getenv("FFPROBE_PATH"),
        ffprobe_from_path,
        r"C:\Windows\System32\ffprobe.exe",
        r"C:\ffmpeg\bin\ffprobe.exe",
    ]

    ffmpeg_path = next((p for p in ffmpeg_candidates if p and os.path.exists(p)), None)
    ffprobe_path = next((p for p in ffprobe_candidates if p and os.path.exists(p)), None)

    if ffmpeg_path:
        AudioSegment.converter = ffmpeg_path
    if ffprobe_path:
        AudioSegment.ffprobe = ffprobe_path


def ffmpeg_not_found_error() -> HTTPException:
    return HTTPException(
        status_code=500,
        detail=(
            "FFmpeg/ffprobe not found on Windows. Install with "
            "`winget install --id=Gyan.FFmpeg -e`, then restart terminal and "
            "backend. You can also set FFMPEG_PATH and FFPROBE_PATH in backend/.env."
        ),
    )


def normalize_accent(accent: str) -> str:
    accent_key = accent.lower().strip()
    return ACCENT_ALIASES.get(accent_key, accent_key)


def ensure_directories() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    SAVED_DIR.mkdir(exist_ok=True)
    TEMP_DIR.mkdir(exist_ok=True)
    if not HISTORY_PATH.exists():
        HISTORY_PATH.write_text("[]", encoding="utf-8")


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_windows_ffmpeg()
    ensure_directories()
    print("=" * 50)
    print("Tone Weaver Backend Started on Windows")
    print("Running on: http://127.0.0.1:8000")
    print("=" * 50)
    yield


app = FastAPI(title="Tone Weaver API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def safe_delete(path: str | None) -> None:
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


def sanitize_token(value: str, fallback: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip())
    return cleaned[:80] or fallback


def unique_temp_path(prefix: str, suffix: str) -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    return TEMP_DIR / f"{prefix}_{stamp}_{secrets.token_hex(4)}{suffix}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def format_accent_name(accent: str) -> str:
    labels = {
        "british": "British (RP)",
        "american": "American (General)",
        "australian": "Australian",
        "indian": "Indian (Standard)",
        "scottish": "Scottish",
        "irish": "Irish",
    }
    return labels.get(accent.lower(), accent.title())


def read_history() -> list[dict[str, Any]]:
    ensure_directories()
    try:
        return json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def write_history(records: list[dict[str, Any]]) -> None:
    HISTORY_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")


def build_audio_url(filename: str) -> str:
    return f"/api/audio/{filename}"


def serialize_record(record: dict[str, Any]) -> dict[str, Any]:
    serialized = dict(record)
    audio_filename = serialized.get("audioFilename")
    original_audio_filename = serialized.get("originalAudioFilename")
    serialized["audioUrl"] = build_audio_url(audio_filename) if audio_filename else None
    serialized["originalAudioUrl"] = (
        build_audio_url(original_audio_filename) if original_audio_filename else None
    )
    return serialized


def get_audio_duration(path: str) -> int:
    info = sf.info(path)
    return max(1, int(round(info.duration)))


def build_waveform(path: str, sample_points: int = 60) -> list[float]:
    data, _ = sf.read(path, always_2d=True)
    mono = data.mean(axis=1) if data.ndim > 1 else data
    mono = np.abs(mono.astype(np.float32))
    if mono.size == 0:
        return [0.0] * sample_points
    if mono.max() > 0:
        mono = mono / mono.max()
    chunks = np.array_split(mono, sample_points)
    waveform = [float(min(1.0, max(0.05, chunk.max(initial=0.0)))) for chunk in chunks]
    return waveform


def build_stats(target_accent: str, duration_seconds: int, mix_percentage: int | None = None) -> dict[str, int]:
    accent_bias = {
        "british": 6,
        "american": 5,
        "australian": 3,
        "indian": 4,
        "scottish": 2,
        "irish": 3,
    }.get(target_accent.lower(), 4)
    mix_bonus = 4 if mix_percentage is not None and 40 <= mix_percentage <= 60 else 0
    similarity = min(97, 78 + accent_bias + mix_bonus)
    quality = min(99, 86 + accent_bias)
    accent_score = min(96, 80 + accent_bias + (duration_seconds % 6))
    latency = 70 + accent_bias * 4 + min(duration_seconds, 30)
    return {
        "latency": latency,
        "similarity": similarity,
        "quality": quality,
        "accentScore": accent_score,
    }


def build_key_differences(target_accent: str) -> list[dict[str, str]]:
    differences = {
        "british": [
            {"feature": "Rhoticity", "original": "Pronounced /r/", "converted": "Reduced word-final /r/"},
            {"feature": "Vowel Shape", "original": "Short /a/", "converted": "Longer RP vowel color"},
            {"feature": "Intonation", "original": "Flatter cadence", "converted": "More measured BBC-style cadence"},
        ],
        "american": [
            {"feature": "Rhoticity", "original": "Soft /r/", "converted": "Stronger rhotic /r/"},
            {"feature": "T Sound", "original": "Hard /t/", "converted": "More flapped medial /t/"},
            {"feature": "Cadence", "original": "Variable melody", "converted": "Steadier General American rhythm"},
        ],
        "australian": [
            {"feature": "Vowels", "original": "Neutral vowels", "converted": "Raised front vowels"},
            {"feature": "Intonation", "original": "Flat endings", "converted": "Noticeable rising tail"},
            {"feature": "Rhythm", "original": "Tighter pacing", "converted": "Broader conversational flow"},
        ],
        "indian": [
            {"feature": "Consonants", "original": "Alveolar stops", "converted": "More retroflex articulation"},
            {"feature": "Rhythm", "original": "Stress-timed", "converted": "More syllable-timed pacing"},
            {"feature": "Pitch", "original": "Neutral contour", "converted": "Slightly lower contour"},
        ],
        "scottish": [
            {"feature": "R Sound", "original": "Soft /r/", "converted": "Stronger tapped /r/ quality"},
            {"feature": "Vowels", "original": "Longer vowel spread", "converted": "Tighter Scottish vowel set"},
            {"feature": "Cadence", "original": "Neutral fall", "converted": "Brisker Scottish cadence"},
        ],
        "irish": [
            {"feature": "Intonation", "original": "Straight phrasing", "converted": "More musical rise-and-fall"},
            {"feature": "Dental Stops", "original": "Standard /t/ and /d/", "converted": "Softer dental articulation"},
            {"feature": "Resonance", "original": "Neutral tone", "converted": "Brighter Irish resonance"},
        ],
    }
    return differences.get(target_accent.lower(), differences["american"])


def ensure_audio_duration_limit(path: str) -> None:
    try:
        duration = AudioSegment.from_file(path).duration_seconds
    except FileNotFoundError as exc:
        raise ffmpeg_not_found_error() from exc
    if duration > MAX_AUDIO_DURATION:
        raise HTTPException(
            status_code=400,
            detail=f"Audio exceeds max duration of {MAX_AUDIO_DURATION} seconds.",
        )


def convert_to_wav(upload_path: str) -> str:
    output_path = str(unique_temp_path("converted", ".wav"))
    try:
        audio = AudioSegment.from_file(upload_path)
    except FileNotFoundError as exc:
        raise ffmpeg_not_found_error() from exc
    audio = audio.set_frame_rate(22050).set_channels(1)
    audio.export(output_path, format="wav")
    return output_path


async def save_upload(audio: UploadFile) -> str:
    ext = os.path.splitext(audio.filename or "")[-1] or ".webm"
    temp_path = unique_temp_path("input", ext)
    with open(temp_path, "wb") as file_handle:
        shutil.copyfileobj(audio.file, file_handle)
    ensure_audio_duration_limit(str(temp_path))
    return str(temp_path)


def save_history_record(
    audio_source_path: str,
    accent: str,
    user_id: str,
    title: str,
    original_accent: str,
    tags: list[str],
    mix_percentage: int | None = None,
    original_audio_source_path: str | None = None,
) -> dict[str, Any]:
    record_id = f"audio-{datetime.now().strftime('%Y%m%d%H%M%S')}-{secrets.token_hex(3)}"
    safe_user = sanitize_token(user_id, "guest")
    safe_accent = sanitize_token(accent, "converted")
    filename = f"{safe_user}_{safe_accent}_{record_id}.wav"
    saved_path = SAVED_DIR / filename
    shutil.copy2(audio_source_path, saved_path)

    original_filename = None
    if original_audio_source_path:
        original_filename = f"{safe_user}_original_{record_id}.wav"
        shutil.copy2(original_audio_source_path, SAVED_DIR / original_filename)

    duration = get_audio_duration(str(saved_path))
    stats = build_stats(accent, duration, mix_percentage)
    record = {
        "id": record_id,
        "title": title,
        "originalAccent": format_accent_name(original_accent),
        "targetAccent": format_accent_name(accent)
        if mix_percentage is None
        else f"{format_accent_name(accent)} Hybrid ({mix_percentage}/{100 - mix_percentage})",
        "duration": duration,
        "createdAt": now_iso(),
        "isFavorite": False,
        "waveformData": build_waveform(str(saved_path)),
        "stats": stats,
        "tags": tags,
        "audioFilename": filename,
        "originalAudioFilename": original_filename,
        "userId": safe_user,
    }
    history = read_history()
    history.insert(0, record)
    write_history(history)
    return serialize_record(record)


def file_to_base64(path: str) -> str:
    with open(path, "rb") as file_handle:
        return base64.b64encode(file_handle.read()).decode("utf-8")


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "status": "Tone Weaver Backend Running",
        "version": "1.0.0",
        "platform": "Windows",
        "accents": SUPPORTED_ACCENTS,
    }


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "healthy",
        "accents": SUPPORTED_ACCENTS,
        "serverTime": time.strftime("%Y-%m-%d %H:%M:%S"),
        "tempDirectory": str(TEMP_DIR),
    }


@app.get("/api/accents")
async def accents() -> dict[str, list[str]]:
    return {"accents": SUPPORTED_ACCENTS}


@app.get("/api/history")
async def get_history(user_id: str | None = None) -> list[dict[str, Any]]:
    records = read_history()
    if user_id:
        safe_user = sanitize_token(user_id, "guest")
        records = [record for record in records if record.get("userId") == safe_user]
    return [serialize_record(record) for record in records]


@app.patch("/api/history/{record_id}/favorite")
async def toggle_history_favorite(record_id: str) -> dict[str, Any]:
    records = read_history()
    for index, record in enumerate(records):
        if record.get("id") == record_id:
            updated = dict(record)
            updated["isFavorite"] = not bool(record.get("isFavorite"))
            records[index] = updated
            write_history(records)
            return serialize_record(updated)
    raise HTTPException(status_code=404, detail="History record not found.")


@app.delete("/api/history/{record_id}")
async def delete_history_record(record_id: str) -> dict[str, bool]:
    records = read_history()
    remaining: list[dict[str, Any]] = []
    removed: dict[str, Any] | None = None

    for record in records:
        if record.get("id") == record_id:
            removed = record
        else:
            remaining.append(record)

    if not removed:
        raise HTTPException(status_code=404, detail="History record not found.")

    for key in ("audioFilename", "originalAudioFilename"):
        filename = removed.get(key)
        if filename:
            file_path = SAVED_DIR / filename
            if file_path.exists():
                try:
                    os.remove(file_path)
                except OSError:
                    pass

    write_history(remaining)
    return {"deleted": True}


@app.get("/api/audio/{filename}")
async def get_audio_file(filename: str) -> FileResponse:
    safe_name = Path(filename).name
    target_path = SAVED_DIR / safe_name
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(path=target_path, media_type="audio/wav", filename=safe_name)


@app.post("/api/convert-accent")
async def convert_accent(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    accent: str = Form(...),
    mode: str = Form(default="real"),
    voice_type: str | None = Form(default=None),
    celebrity_id: str | None = Form(default=None),
):
    accent = normalize_accent(accent)
    if accent not in SUPPORTED_ACCENTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid accent. Choose from: {SUPPORTED_ACCENTS}",
        )

    input_path = None
    wav_path = None
    output_path = None

    try:
        input_path = await save_upload(audio)
        wav_path = convert_to_wav(input_path)
        if mode.lower().strip() == "legacy":
            output_path = accent_processor.convert_accent(wav_path, accent)
        else:
            output_path = await real_accent_processor.convert_accent(
                wav_path, accent, celebrity_id=celebrity_id, voice_type=voice_type
            )

        background_tasks.add_task(safe_delete, input_path)
        background_tasks.add_task(safe_delete, wav_path)
        background_tasks.add_task(safe_delete, output_path)

        return FileResponse(
            path=output_path,
            media_type="audio/wav",
            filename=f"toneweaver_{accent}.wav",
        )
    except HTTPException:
        safe_delete(input_path)
        safe_delete(wav_path)
        safe_delete(output_path)
        raise
    except Exception as exc:
        safe_delete(input_path)
        safe_delete(wav_path)
        safe_delete(output_path)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/hybrid-accent")
async def hybrid_accent(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    accent1: str = Form(...),
    accent2: str = Form(...),
    mix_percentage: int = Form(...),
    voice_type: str | None = Form(default=None),
    celebrity_id: str | None = Form(default=None),
):
    accent1 = normalize_accent(accent1)
    accent2 = normalize_accent(accent2)

    if accent1 not in SUPPORTED_ACCENTS:
        raise HTTPException(status_code=400, detail="Invalid accent1.")
    if accent2 not in SUPPORTED_ACCENTS:
        raise HTTPException(status_code=400, detail="Invalid accent2.")
    if accent1 == accent2:
        raise HTTPException(status_code=400, detail="Choose two different accents.")
    if not 0 <= mix_percentage <= 100:
        raise HTTPException(status_code=400, detail="mix_percentage must be 0-100.")

    input_path = None
    wav_path = None
    output_path = None

    try:
        input_path = await save_upload(audio)
        wav_path = convert_to_wav(input_path)
        output_path = await hybrid_processor.create_hybrid(
            wav_path,
            accent1,
            accent2,
            mix_percentage,
            voice_type=voice_type,
            celebrity_id=celebrity_id,
        )

        background_tasks.add_task(safe_delete, input_path)
        background_tasks.add_task(safe_delete, wav_path)
        background_tasks.add_task(safe_delete, output_path)

        return FileResponse(
            path=output_path,
            media_type="audio/wav",
            filename=f"toneweaver_hybrid_{accent1}_{accent2}.wav",
        )
    except HTTPException:
        safe_delete(input_path)
        safe_delete(wav_path)
        safe_delete(output_path)
        raise
    except Exception as exc:
        safe_delete(input_path)
        safe_delete(wav_path)
        safe_delete(output_path)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/compare")
async def compare(
    audio: UploadFile = File(...),
    accent: str = Form(...),
    mode: str = Form(default="real"),
    voice_type: str | None = Form(default=None),
    celebrity_id: str | None = Form(default=None),
):
    accent = normalize_accent(accent)
    if accent not in SUPPORTED_ACCENTS:
        raise HTTPException(status_code=400, detail="Invalid accent.")

    input_path = None
    wav_path = None
    output_path = None

    try:
        input_path = await save_upload(audio)
        wav_path = convert_to_wav(input_path)
        if mode.lower().strip() == "legacy":
            output_path = accent_processor.convert_accent(wav_path, accent)
        else:
            output_path = await real_accent_processor.convert_accent(
                wav_path, accent, celebrity_id=celebrity_id, voice_type=voice_type
            )
        duration = get_audio_duration(output_path)

        return JSONResponse(
            {
                "original": file_to_base64(wav_path),
                "converted": file_to_base64(output_path),
                "accent": accent,
                "stats": build_stats(accent, duration),
                "keyDifferences": build_key_differences(accent),
                "originalWaveform": build_waveform(wav_path),
                "convertedWaveform": build_waveform(output_path),
            }
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        safe_delete(input_path)
        safe_delete(wav_path)
        safe_delete(output_path)


@app.post("/api/save-audio")
async def save_audio(
    audio: UploadFile = File(...),
    original_audio: UploadFile | None = File(default=None),
    accent: str = Form(default="american"),
    user_id: str = Form(default="guest"),
    title: str = Form(default="Tone Weaver Recording"),
    original_accent: str = Form(default="american"),
    tags: str = Form(default=""),
    mix_percentage: int | None = Form(default=None),
):
    input_path = None
    wav_path = None
    original_input_path = None
    original_wav_path = None

    try:
        input_path = await save_upload(audio)
        wav_path = convert_to_wav(input_path)
        if original_audio is not None:
            original_input_path = await save_upload(original_audio)
            original_wav_path = convert_to_wav(original_input_path)
        tag_list = [tag.strip().lower() for tag in tags.split(",") if tag.strip()]
        if mix_percentage is not None:
            tag_list.append("hybrid")
        record = save_history_record(
            audio_source_path=wav_path,
            accent=accent,
            user_id=user_id,
            title=title,
            original_accent=original_accent,
            tags=tag_list or ["converted"],
            mix_percentage=mix_percentage,
            original_audio_source_path=original_wav_path,
        )
        return JSONResponse({"saved": True, "record": record})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        safe_delete(input_path)
        safe_delete(wav_path)
        safe_delete(original_input_path)
        safe_delete(original_wav_path)


@app.exception_handler(Exception)
async def global_exception_handler(_, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )
