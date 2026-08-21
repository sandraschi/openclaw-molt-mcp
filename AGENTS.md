# openclaw-molt-mcp — Agent Guide

## What this repo is

FastMCP server + webapp that bridges Claude Desktop / Cursor to **OpenClaw** (agent
Gateway, channels, routing, sessions, skills, security) and **Moltbook** (AI-agent
social network). It *uses* those platforms; it does not implement or replace them.

## Architecture

- **MCP tools** — `src/openclaw_molt_mcp/tools/` (11 portmanteau tools: `clawd_agent`,
  `clawd_bastion`, `clawd_channels`, `clawd_gateway`, `clawd_moltbook`,
  `clawd_openclaw_disconnect`, `clawd_routing`, `clawd_security`, `clawd_sessions`,
  `clawd_skills`, `clawd_voice`). Each has one `@mcp.tool()` entrypoint with an
  `operation` enum param, and a docstring with `**Operations:**`, `## Return Format`,
  and `## Examples`.
- **Webapp API** — `webapp_api/main.py` (FastAPI, port **10745**) serves the React SPA.
- **Webapp UI** — `webapp/` (React + Vite + TypeScript, port **10744**).
- **Desktop** — `native/` (Tauri 2 + PyInstaller sidecar → NSIS installer).

## Ports

| Port | Service |
|------|---------|
| 10744 | Vite frontend |
| 10745 | FastAPI backend + static SPA |
| 18789 | OpenClaw Gateway (external daemon port) |

## Conventions

- Run Python with `uv run --directory <repo> --extra dev` — never naked `python`.
- Run JS with `bun` (bun.lock is the lockfile). Never `npm`.
- Lint: `uv run ruff check .` and `uv run ruff format --check .`; format with `uv run ruff format`.
- Type check: `uv run pyright src`. Tests: `uv run pytest --cov=openclaw_molt_mcp`.
- Webapp (in `webapp/`): `bun run lint`, `bun run type-check`, `bun run build`.
- Config: pydantic-settings (`src/openclaw_molt_mcp/config.py`, `OPENCLAW_` prefix),
  read from `.env` (gitignored). Document keys in `.env.example` — never hardcode secrets.
- Gateway client: `src/openclaw_molt_mcp/gateway_client.py`; Moltbook: `moltbook_client.py`.
- Do NOT commit `node_modules/`, `.venv/`, `.bak*`, `_llm_test_scripts/`, `dist/`, `target/`.

## Standards

Read the fleet hub before significant work:
`D:\Dev\repos\mcp-central-docs\README.md` and `D:\Dev\repos\mcp-central-docs\standards\AGENTS.md`.
Tool design: `standards/TOOL_DESIGN_STANDARDS.md` (portmanteau pattern, docstrings).
