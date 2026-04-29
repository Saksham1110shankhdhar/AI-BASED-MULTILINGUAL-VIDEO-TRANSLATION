# services/ffmpeg_service.py
import os
import shutil
import logging

logger = logging.getLogger("services.ffmpeg_service")

def ensure_ffmpeg_path():
    """
    Ensure a local ffmpeg binary is available and add it to PATH.
    Set env var FFMPEG_BINARY to the full executable path.
    Returns full path or None.
    
    Priority:
    1. User's specified FFmpeg path
    2. Local build in project
    3. System FFmpeg on PATH
    """
    # Priority 1: User's specified FFmpeg path
    user_ffmpeg_path = r"C:\ffmpeg\ffmpeg-2025-12-24-git-abb1524138-full_build\bin\ffmpeg.exe"
    if os.path.exists(user_ffmpeg_path):
        os.environ['PATH'] = os.path.dirname(user_ffmpeg_path) + os.pathsep + os.environ.get('PATH', '')
        os.environ['FFMPEG_BINARY'] = user_ffmpeg_path
        logger.info(f"✅ Using user's FFmpeg: {user_ffmpeg_path}")
        return user_ffmpeg_path
    
    # Priority 2: Local build in project
    base = os.path.dirname(__file__)
    local_bin = os.path.join(base, '..', 'ffmpeg-8.0-essentials_build', 'bin')
    ffmpeg_exe = os.path.join(local_bin, 'ffmpeg.exe')
    
    if os.path.exists(ffmpeg_exe):
        os.environ['PATH'] = local_bin + os.pathsep + os.environ.get('PATH', '')
        os.environ['FFMPEG_BINARY'] = ffmpeg_exe
        logger.info(f"Using local ffmpeg: {ffmpeg_exe}")
        return ffmpeg_exe

    # Priority 3: System ffmpeg on PATH
    system_ffmpeg = shutil.which('ffmpeg')
    if system_ffmpeg:
        os.environ['FFMPEG_BINARY'] = system_ffmpeg
        logger.info(f"Using system ffmpeg: {system_ffmpeg}")
        return system_ffmpeg

    logger.error(f"❌ FFmpeg not found!")
    logger.error(f"   Checked: {user_ffmpeg_path}")
    logger.error(f"   Checked: {ffmpeg_exe}")
    logger.error(f"   Checked: system PATH")
    return None
