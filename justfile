set windows-shell := ["pwsh.exe", "-NoLogo", "-Command"]

# ── Dashboard ─────────────────────────────────────────────────────────────────

# Open the interactive recipe dashboard in the browser
default:
    @pwsh.exe -NoProfile -ExecutionPolicy Bypass -File ../mcp-central-docs/scripts/just-dashboard.ps1 -Path .

# ── Quality ───────────────────────────────────────────────────────────────────

# Execute Ruff SOTA v13.1 linting
lint:
    Set-Location '{{justfile_directory()}}'
    uv run ruff check .
    Set-Location '{{justfile_directory()}}\web_sota'
    npx @biomejs/biome ci .

# Execute Ruff SOTA v13.1 fix and formatting
fix:
    Set-Location '{{justfile_directory()}}'
    uv run ruff check . --fix --unsafe-fixes
    uv run ruff format .
    Set-Location '{{justfile_directory()}}\web_sota'
    npx @biomejs/biome check --write .

# ── Hardening ─────────────────────────────────────────────────────────────────

# Execute Bandit security audit
check-sec:
    Set-Location '{{justfile_directory()}}'
    uv run bandit -r src/

# Execute safety audit of dependencies
audit-deps:
    Set-Location '{{justfile_directory()}}'
    uv run safety check

# openclaw-molt-mcp justfile

stats:
    uv run python tools/repo_stats.py

check:
    ruff check src tests
    ruff format --check src tests
    mypy src
    pytest tests -v

test:
    pytest tests -v

test-cov:
    pytest tests -v --cov=openclaw_molt_mcp --cov-report=term-missing

typecheck:
    mypy src

# MCPB package: copy src into mcpb then pack (current standard). Output: dist/openclaw-molt-mcp-<version>.mcpb
mcpb:
    pwsh -NoProfile -File scripts/mcpb-build.ps1
