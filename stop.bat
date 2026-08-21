@echo off
REM Stop openclaw-molt-mcp fleet ports (10745 backend, 10744 frontend)
for %%P in (10745 10744) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%P ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)
