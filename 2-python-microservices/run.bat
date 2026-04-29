@echo off
REM Simple script to run the Python microservices server
REM Just double-click this file or run: run.bat
cd /d "%~dp0"
echo Starting Python Microservices Server...
echo.
.venv\Scripts\python.exe app.py
pause

