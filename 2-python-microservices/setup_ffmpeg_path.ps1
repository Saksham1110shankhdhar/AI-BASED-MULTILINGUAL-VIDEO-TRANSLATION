# setup_ffmpeg_path.ps1
# Script to add FFmpeg to system PATH permanently

$ffmpegPath = "C:\ffmpeg\ffmpeg-2025-12-24-git-abb1524138-full_build\bin"

Write-Host "Setting up FFmpeg PATH..." -ForegroundColor Cyan

# Check if FFmpeg exists
if (Test-Path "$ffmpegPath\ffmpeg.exe") {
    Write-Host "✅ FFmpeg found at: $ffmpegPath" -ForegroundColor Green
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    # Check if already in PATH
    if ($currentPath -notlike "*$ffmpegPath*") {
        Write-Host "Adding FFmpeg to User PATH..." -ForegroundColor Yellow
        
        # Add to User PATH (permanent)
        $newPath = $currentPath + ";$ffmpegPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        
        # Also add to current session
        $env:Path += ";$ffmpegPath"
        
        Write-Host "✅ FFmpeg added to PATH!" -ForegroundColor Green
        Write-Host "   Note: You may need to restart your terminal for changes to take effect." -ForegroundColor Yellow
    } else {
        Write-Host "✅ FFmpeg is already in PATH" -ForegroundColor Green
    }
    
    # Test FFmpeg
    Write-Host "`nTesting FFmpeg..." -ForegroundColor Cyan
    & "$ffmpegPath\ffmpeg.exe" -version | Select-Object -First 3
    
    Write-Host "`n✅ Setup complete!" -ForegroundColor Green
} else {
    Write-Host "❌ FFmpeg not found at: $ffmpegPath" -ForegroundColor Red
    Write-Host "   Please check the path and update this script if needed." -ForegroundColor Yellow
    exit 1
}

