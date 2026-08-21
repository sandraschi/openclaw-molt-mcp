# openclaw-molt-mcp repo standards

Repo-local coding standards for agents working in `D:\Dev\repos\openclaw-molt-mcp`.

## Stack

- Python 3.12 + FastMCP 3.4.4 (MCP tools), FastAPI (webapp API :10745), React/Vite/TS (webapp :10744), Tauri 2 (desktop).
- Python via `uv` (never naked `python`); JS via `bun` (never `npm`).

## Gates (must pass before done)

- `uv run ruff check .` and `uv run ruff format --check .`
- `uv run pyright src`
- `uv run pytest --cov=openclaw_molt_mcp` (threshold: 40%)
- In `webapp/`: `bun run lint`, `bun run type-check`, `bun run build`

## Tool design

- Portmanteau pattern: one `@mcp.tool()` per domain with an `operation` Literal enum.
- Docstrings must include `**Operations:**`, `## Return Format`, `## Examples`.
- Return `{"success": bool, "message": str, "data": {...}}`; `error` on failure.

## Don'ts

- No hardcoded secrets/ports in source. Use `.env` + document in `.env.example`.
- Do not commit `node_modules/`, `.venv/`, `.bak*`, `_llm_test_scripts/`, `dist/`, `target/`.
- Do not touch `web_sota/` (deleted runt) or legacy ports 10764/10765/5180/5181 — use 10744 (frontend) / 10745 (backend) / 18789 (Gateway).

## Fleet hub

Read `D:\Dev\repos\mcp-central-docs\README.md` and `standards\AGENTS.md` before significant work.
