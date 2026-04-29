# services/video_utils.py
import cv2
import subprocess
import logging
from pydub import AudioSegment
import os

logger = logging.getLogger("services.video_utils")

def get_video_duration(video_path: str) -> float:
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0.0
        cap.release()
        if fps > 0 and frame_count > 0:
            return frame_count / fps
    except Exception as e:
        logger.warning(f"cv2 duration failed: {e}")

    # fallback to ffprobe
    try:
        from services.ffmpeg_service import ensure_ffmpeg_path
        ffmpeg = ensure_ffmpeg_path() or "ffmpeg"
        cmd = [
            'ffprobe', '-v', 'error', '-show_entries',
            'format=duration', '-of',
            'default=noprint_wrappers=1:nokey=1', video_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and res.stdout.strip():
            return float(res.stdout.strip())
    except Exception as e:
        logger.warning(f"ffprobe duration failed: {e}")

    return 0.0


def get_video_fps(video_path: str) -> float:
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        cap.release()
        if fps and fps > 0:
            return fps
    except Exception:
        pass
    return 25.0


def match_audio_to_video(audio_path: str, video_path: str, output_path: str) -> str:
    try:
        video_duration = get_video_duration(video_path)
        if video_duration <= 0:
            logger.warning("Could not determine video duration")
            # just convert to wav and return
            audio = AudioSegment.from_file(audio_path)
            audio.export(output_path, format="wav")
            return output_path

        audio = AudioSegment.from_file(audio_path)
        audio_duration = len(audio) / 1000.0

        logger.info(f"Video {video_duration:.2f}s Audio {audio_duration:.2f}s")

        # If within tolerance, just export wav
        if abs(video_duration - audio_duration) < 0.12:
            audio.export(output_path, format="wav")
            return output_path

        # adjust by frame-rate-preserving time-stretch approach
        if audio_duration < video_duration:
            # add silence if too short
            silence = AudioSegment.silent(duration=int((video_duration - audio_duration) * 1000))
            audio = audio + silence
        else:
            # trim
            audio = audio[:int(video_duration * 1000)]

        audio.export(output_path, format="wav")
        return output_path
    except Exception as e:
        logger.error(f"match_audio_to_video failed: {e}")
        # fallback
        try:
            audio = AudioSegment.from_file(audio_path)
            audio.export(output_path, format="wav")
            return output_path
        except:
            return audio_path
