# add_ffmpeg_to_session.ps1
# Quick script to add FFmpeg to current PowerShell session PATH

$ffmpegPath = "C:\ffmpeg\ffmpeg-2025-12-24-git-abb1524138-full_build\bin"

if (Test-Path "$ffmpegPath\ffmpeg.exe") {
    $env:Path += ";$ffmpegPath"
    Write-Host "✅ FFmpeg added to current session PATH" -ForegroundColor Green
    Write-Host "   You can now use 'ffmpeg' command in this terminal" -ForegroundColor Cyan
    
    # Test it
    Write-Host "`nTesting FFmpeg..." -ForegroundColor Cyan
    ffmpeg -version | Select-Object -First 3
} else {
    Write-Host "❌ FFmpeg not found at: $ffmpegPath" -ForegroundColor Red
}

