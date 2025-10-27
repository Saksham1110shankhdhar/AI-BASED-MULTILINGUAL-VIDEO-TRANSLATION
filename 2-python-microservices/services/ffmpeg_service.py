import os

def ensure_ffmpeg_path():
    ffmpeg_bin = os.path.join(os.path.dirname(__file__), '..', 'ffmpeg-8.0-essentials_build', 'bin')
    if os.path.exists(ffmpeg_bin):
        os.environ['PATH'] = ffmpeg_bin + os.pathsep + os.environ['PATH']
        print(f"✅ Added local ffmpeg to PATH: {ffmpeg_bin}")
