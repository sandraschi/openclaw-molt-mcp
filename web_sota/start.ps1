param(
    [switch]$Headless,
    [switch]$BackendOnly,
    [switch]$NoBrowser
)

$WebPort = 10764
$BackendPort = 10765
$ProjectRoot = Split-Path -Parent $PSScriptRoot

$FleetStartPath = Join-Path $ProjectRoot "scripts\FleetStartMode.ps1"
if (-not (Test-Path -LiteralPath $FleetStartPath)) {
    Write-Host "ERROR: Missing vendored launcher helper: $FleetStartPath" -ForegroundColor Red
    exit 1
}
. $FleetStartPath
$FleetStart = Initialize-FleetStartMode @PSBoundParameters
Enter-FleetHeadlessConsole -Headless:$Headless -BackendOnly:$BackendOnly
Stop-FleetPortSquatters -Ports @($WebPort, $BackendPort) -Label "openclaw-molt-mcp"

if (-not (Assert-FleetPortsAvailable -Ports @($WebPort, $BackendPort) -Label "openclaw-molt-mcp")) { exit 1 }

Set-Location $PSScriptRoot
if (-not (Test-Path "node_modules")) { npm install }

Set-Location $ProjectRoot
$needsSync = $false
try {
    $null = uv run --project $ProjectRoot python -c "import fastapi" 2>$null
    if ($LASTEXITCODE -ne 0) { $needsSync = $true }
} catch {
    $needsSync = $true
}
if ($needsSync) {
    Write-Host "Installing webapp-api deps (one-time uv sync)..." -ForegroundColor Gray
    uv sync --project $ProjectRoot --extra webapp-api
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: uv sync --extra webapp-api failed." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting Python backend on port $BackendPort ..." -ForegroundColor Cyan
$backendCmd = "Set-Location '$ProjectRoot'; uv run --project '$ProjectRoot' uvicorn webapp_api.main:app --host 127.0.0.1 --port $BackendPort --log-level info"
Start-Process powershell -ArgumentList "-NoProfile", "-WindowStyle", "Normal", "-Command", $backendCmd

$healthUrl = "http://127.0.0.1:$BackendPort/api/health"
$attempt = 0
while ($attempt -lt 45) {
    try {
        $null = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "Backend ready at $healthUrl" -ForegroundColor Green
        break
    } catch {
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if (-not $FleetStart.RunFrontend) {
    while ($true) { Start-Sleep -Seconds 60 }
}

if (-not $NoBrowser) {
    $frontendUrl = "http://127.0.0.1:$WebPort/"
    $pollAndOpen = "for (`$i = 0; `$i -lt 60; `$i++) { try { `$null = Invoke-WebRequest -Uri '$frontendUrl' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; Start-Process '$frontendUrl'; exit } catch { Start-Sleep -Seconds 1 } }"
    Start-Process powershell -ArgumentList "-NoProfile", "-WindowStyle", "Hidden", "-Command", $pollAndOpen
}

Write-Host "Starting Vite frontend on port $WebPort ..." -ForegroundColor Green
Set-Location $PSScriptRoot
npm run dev -- --port $WebPort --host 127.0.0.1 --strictPort


