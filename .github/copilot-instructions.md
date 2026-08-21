# GitHub Copilot instructions for openclaw-molt-mcp

FastMCP server + webapp bridging Claude Desktop/Cursor to OpenClaw Gateway and Moltbook.

## Guidelines

- Follow existing conventions. Match surrounding code style.
- MCP tools: portmanteau pattern — one `@mcp.tool()` per domain, `operation` Literal enum param.
- Tool docstrings: `**Operations:**`, `## Return Format`, `## Examples`.
- Return `{"success": bool, "message": str, "data": {...}}`.
- Python via `uv run --extra dev`; JS via `bun` (never `npm`).
- Config via pydantic-settings + `.env` (gitignored). Never hardcode secrets; document in `.env.example`.
- Ports: webapp API 10745, Vite frontend 10744, OpenClaw Gateway 18789 (external daemon port).

## Gates

- `uv run ruff check .` / `uv run ruff format --check .`
- `uv run pyright src`
- `uv run pytest`
- `webapp/`: `bun run lint`, `bun run type-check`, `bun run build`

Fleet-wide standards: `D:\Dev\repos\mcp-central-docs\standards\AGENTS.md`.
