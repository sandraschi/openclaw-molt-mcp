# clawd-mcp start script - webapp API (5181) and webapp dev server (5180)
# Run from repo root or scripts/. Kills existing processes on 5181/5180, then opens two windows.

$ErrorActionPreference = "Stop"
$projectRoot = if ($PSScriptRoot) { (Resolve-Path (Join-Path (Split-Path -Parent $PSScriptRoot) ".")).Path } else { (Get-Location).Path }
if (-not (Test-Path (Join-Path $projectRoot "webapp_api\main.py"))) {
    $projectRoot = (Get-Location).Path
}
Set-Location $projectRoot

# Kill zombies on 5181 and 5180 so we don't port-hop. Wait after kill so OS releases ports
# and we don't race with any watcher (killed process is dead; sleep is for port release).
function Stop-ProcessOnPort {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $conn.OwningProcess | Sort-Object -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
            Write-Host "Killed PID $_ on port $Port"
        }
    }
}
Stop-ProcessOnPort -Port 5181
Stop-ProcessOnPort -Port 5180
Start-Sleep -Seconds 2

$srcPath = (Join-Path $projectRoot "src") -replace "'", "''"
$webappPath = (Join-Path $projectRoot "webapp") -replace "'", "''"

Write-Host "Starting webapp API (port 5181)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='$srcPath'; try { uvicorn webapp_api.main:app --reload --port 5181 } finally { Read-Host 'Press Enter to close' }"

Start-Sleep -Seconds 2
Write-Host "Starting webapp dev server (port 5180)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$webappPath'; try { npm run dev } finally { Read-Host 'Press Enter to close' }"

Write-Host "API: http://127.0.0.1:5181  Webapp: http://localhost:5180"
