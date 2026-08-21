@echo off
REM Restart openclaw-molt-mcp via fleet-standard launcher (clears ports, starts backend + frontend)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
    echo start failed
    pause
    exit /b 1
)
pause
