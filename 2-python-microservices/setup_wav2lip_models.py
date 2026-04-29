"""
Setup script to download Wav2Lip models automatically
"""
import os
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models" / "wav2lip"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_URLS = {
    "wav2lip_gan.pth": "https://iiitaphyd-my.sharepoint.com/:u:/g/personal/radrabha_m_research_iiit_ac_in/Eb3LEzbfuKlJiR600lQWRxgB6v4XeQc8G8KCjEYYk2PIWA?e=n9ljGW&download=1",
    "s3fd-619a316812.pth": "https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth"
}

def download_file(url: str, filepath: Path):
    """Download a file with progress"""
    print(f"Downloading {filepath.name}...")
    print(f"URL: {url}")
    
    def show_progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(downloaded * 100 / total_size, 100)
        print(f"\rProgress: {percent:.1f}%", end="")
    
    try:
        urllib.request.urlretrieve(url, filepath, reporthook=show_progress)
        print(f"\n✅ Downloaded: {filepath.name}")
        return True
    except Exception as e:
        print(f"\n❌ Failed to download {filepath.name}: {e}")
        return False

def main():
    print("=" * 60)
    print("Wav2Lip Models Setup")
    print("=" * 60)
    print()
    
    for model_name, url in MODEL_URLS.items():
        model_path = MODELS_DIR / model_name
        
        if model_path.exists():
            print(f"✅ {model_name} already exists")
            continue
        
        print(f"\n📥 Downloading {model_name}...")
        success = download_file(url, model_path)
        
        if not success:
            print(f"\n⚠️  Manual download required:")
            print(f"   URL: {url}")
            print(f"   Save to: {model_path}")
            print()
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print(f"\nModels directory: {MODELS_DIR}")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. (Optional) Clone Wav2Lip repo for best results:")
    print("   git clone https://github.com/Rudrabha/Wav2Lip.git")
    print("3. Start the server: python app.py")

if __name__ == "__main__":
    main()

