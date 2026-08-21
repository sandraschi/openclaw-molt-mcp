set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]
import 'scripts/just/fleet.just'

# --- Dashboard ---

# Open the interactive recipe dashboard in the browser
default:
    @just --list

# --- Quality ---

# Lint (ruff + biome)
lint:
    Set-Location '{{justfile_directory()}}'
    uv run ruff check .
    Set-Location '{{justfile_directory()}}\webapp'
    bun run lint

# Fix and format (ruff + biome)
fix:
    Set-Location '{{justfile_directory()}}'
    uv run ruff check . --fix --unsafe-fixes
    uv run ruff format .
    Set-Location '{{justfile_directory()}}\webapp'
    bun run check

# --- Hardening ---

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
    uv run ruff check src tests webapp_api
    uv run ruff format --check src tests webapp_api
    uv run pyright src webapp_api
    uv run pytest tests -v

test:
    uv run pytest tests -v

test-cov:
    uv run pytest tests -v --cov=openclaw_molt_mcp --cov-report=term-missing

typecheck:
    uv run pyright src webapp_api

# MCPB package: copy src into mcpb then pack (current standard). Output: dist/openclaw-molt-mcp-<version>.mcpb
mcpb:
    powershell.exe -NoProfile -File scripts/mcpb-build.ps1

# Bootstrap: install dev deps + pre-commit hook
bootstrap:
    uv sync --group dev
    uv run pre-commit install
    Write-Host "Pre-commit hooks installed." -ForegroundColor Green