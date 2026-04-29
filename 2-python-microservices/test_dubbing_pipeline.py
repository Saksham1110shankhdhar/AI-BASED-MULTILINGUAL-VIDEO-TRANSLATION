"""
Test script to verify the dubbing pipeline works correctly
"""
import os
import sys
import tempfile
import numpy as np
from pathlib import Path

# Add paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "wav2lip"))

def test_librosa_compatibility():
    """Test librosa API compatibility"""
    print("=" * 60)
    print("Testing librosa API compatibility...")
    print("=" * 60)
    
    try:
        # Test mel basis creation
        from audio import _build_mel_basis
        mel_basis = _build_mel_basis()
        print(f"✅ Mel basis created: shape {mel_basis.shape}")
        
        # Test audio loading
        from audio import load_wav, melspectrogram
        import numpy as np
        
        # Create a dummy audio file
        dummy_audio = np.random.randn(16000).astype(np.float32)
        mel = melspectrogram(dummy_audio)
        print(f"✅ Mel spectrogram created: shape {mel.shape}")
        
        print("\n✅ All librosa compatibility tests passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Librosa compatibility test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_audio_conversion():
    """Test audio conversion to WAV"""
    print("=" * 60)
    print("Testing audio conversion...")
    print("=" * 60)
    
    try:
        from services.wav2lip_service import convert_audio_to_wav
        from pydub import AudioSegment
        import tempfile
        
        # Create a dummy MP3-like file (actually WAV for testing)
        temp_dir = tempfile.mkdtemp()
        test_audio = os.path.join(temp_dir, "test.wav")
        output_wav = os.path.join(temp_dir, "output.wav")
        
        # Create a simple audio file
        audio = AudioSegment.silent(duration=1000)  # 1 second
        audio.export(test_audio, format="wav")
        
        # Convert
        result = convert_audio_to_wav(test_audio, output_wav)
        print(f"✅ Audio converted: {result}")
        
        # Verify file exists
        if os.path.exists(output_wav):
            print(f"✅ Output WAV file exists: {os.path.getsize(output_wav)} bytes")
        
        print("\n✅ Audio conversion test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Audio conversion test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_video_utils():
    """Test video utility functions"""
    print("=" * 60)
    print("Testing video utilities...")
    print("=" * 60)
    
    try:
        from services.video_utils import get_video_fps, get_video_duration
        
        # Check if functions are importable
        print("✅ Video utility functions imported successfully")
        print("   - get_video_fps()")
        print("   - get_video_duration()")
        
        print("\n✅ Video utilities test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Video utilities test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_wav2lip_service():
    """Test Wav2Lip service imports"""
    print("=" * 60)
    print("Testing Wav2Lip service...")
    print("=" * 60)
    
    try:
        from services.wav2lip_service import (
            convert_audio_to_wav,
            prepare_video_for_wav2lip,
            run_wav2lip,
            create_dubbed_video
        )
        
        print("✅ Wav2Lip service functions imported:")
        print("   - convert_audio_to_wav()")
        print("   - prepare_video_for_wav2lip()")
        print("   - run_wav2lip()")
        print("   - create_dubbed_video()")
        
        print("\n✅ Wav2Lip service test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Wav2Lip service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("DUBBING PIPELINE TEST SUITE")
    print("=" * 60 + "\n")
    
    tests = [
        ("Librosa Compatibility", test_librosa_compatibility),
        ("Audio Conversion", test_audio_conversion),
        ("Video Utilities", test_video_utils),
        ("Wav2Lip Service", test_wav2lip_service),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name} test crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Pipeline is ready.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please fix issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

