# Development

Development setup, tooling, and contribution workflow for openclaw-molt-mcp.

## Onboarding status

**Onboarding: Required.** This repo bridges **OpenClaw** and **Moltbook**, both of
which need external install/account setup. First-timers must complete
[docs/ONBOARDING.md](ONBOARDING.md) before live host calls work. (Not N/A.)

## Prerequisites

- Windows 10/11, PowerShell 7
- [uv](https://docs.astral.sh/uv/) (Python package manager — never naked `python`)
- [bun](https://bun.sh) (JS package manager — never `npm`)
- Optional: `just` command runner

## Setup

```powershell
# Python deps (MCP server + webapp API)
uv sync --extra dev --extra webapp-api

# JS deps (webapp)
Set-Location webapp
bun install
```

## Run

```powershell
# Full webapp (backend :10745 + frontend :10744)
.\start.ps1
# -> http://127.0.0.1:10744/app/

# MCP stdio
uv run python -m openclaw_molt_mcp.server
```

## Quality gates (must pass before done)

| Gate | Command |
|------|---------|
| Lint | `uv run ruff check .` |
| Format | `uv run ruff format --check .` |
| Type check | `uv run pyright src` |
| Tests | `uv run pytest --cov=openclaw_molt_mcp` (threshold 40%) |
| Webapp lint | `bun run lint` (in `webapp/`) |
| Webapp type | `bun run type-check` (in `webapp/`) |
| Webapp build | `bun run build` (in `webapp/`) |

CI runs all of the above (Windows-only) — see `.github/workflows/ci.yml`.

## Layout

- `src/openclaw_molt_mcp/tools/` — 11 MCP portmanteau tools
- `src/openclaw_molt_mcp/config.py` — pydantic-settings (env `OPENCLAW_`)
- `src/openclaw_molt_mcp/gateway_client.py` — OpenClaw Gateway client
- `src/openclaw_molt_mcp/moltbook_client.py` — Moltbook API client
- `webapp_api/` — FastAPI backend (:10745) + CORS for :10744/tauri
- `webapp/` — React + Vite + TS frontend (:10744)
- `native/` — Tauri 2 desktop shell + PyInstaller sidecar
- `tests/` — pytest suite

## Conventions

- **Python**: ruff (line length 120), type hints, pyright-clean. Run via `uv run`.
- **JS/TS**: bun, Biome (lint + format via `bun run lint` / `bun run check`), `tsc`.
- **Tool design**: portmanteau pattern — one `@mcp.tool()` per domain with an
  `operation` Literal enum. Docstrings must include `**Operations:**`,
  `## Return Format`, `## Examples`.
- No Unicode emojis in source or logger messages.
- Use pathlib and cross-platform patterns.

## Git / branch

- Default branch is `main`. Work on feature branches; PR against `main`.
- Do not commit `node_modules/`, `.venv/`, `.bak*`, `_llm_test_scripts/`, `dist/`, `target/`.

## Docs

Update the `docs/` stack (README, INSTALL, CONFIGURATION, TOOLS, TROUBLESHOOTING,
ONBOARDING) and `CHANGELOG.md` when behavior or setup changes.
