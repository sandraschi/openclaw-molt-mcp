@echo off
REM openclaw-molt-mcp start - webapp API (10745) and webapp dev server (10744)
REM Run from repo root. Kills existing processes on 10745/10744, then opens two windows.

cd /d "%~dp0\.."
set PYTHONPATH=%CD%\src

REM Kill zombies on 10745 and 10744 so we don't port-hop. Wait after kill so OS releases ports.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":10745"') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":10744"') do taskkill /PID %%a /F 2>nul
timeout /t 2 /nobreak >nul

echo Starting webapp API (port 10745)...
start "openclaw-molt-mcp API" cmd /k "set PYTHONPATH=%PYTHONPATH% & uvicorn webapp_api.main:app --reload --port 10745 & pause"

timeout /t 2 /nobreak >nul
echo Starting webapp dev server (port 10744)...
start "openclaw-molt-mcp Webapp" cmd /k "cd webapp & set VITE_PORT=10744 & bun run dev & pause"

echo API: http://127.0.0.1:10745  Webapp: http://localhost:10744
