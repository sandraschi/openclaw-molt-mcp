# Troubleshooting

Symptom → fix for openclaw-molt-mcp. For install/setup issues first see
[INSTALL.md](../INSTALL.md) and [ONBOARDING.md](ONBOARDING.md).

## Health page / `GET /api/health/aggregate`

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `gateway: false` / "Gateway unreachable" | OpenClaw Gateway not running, wrong URL, or token mismatch | Start the Gateway; verify `OPENCLAW_GATEWAY_URL` (`http://127.0.0.1:18789`) and `OPENCLAW_GATEWAY_TOKEN`. |
| `openclaw_cli: false` / "CLI not found" | `openclaw` not on PATH | Install the CLI or set `OPENCLAW_OPENCLAW_PATH` to the full path (e.g. `C:\Users\...\npm\openclaw.cmd`). |
| `moltbook: false` / 401 | Missing or wrong `MOLTBOOK_API_KEY`, or non-`www` URL | Set `MOLTBOOK_API_KEY` in `.env`; keep `OPENCLAW_MOLTBOOK_URL=https://www.moltbook.com/api/v1`. |
| `ollama: false` | Ollama not running or wrong `OLLAMA_BASE` | Start Ollama; set `OLLAMA_BASE` if not `http://localhost:11434`. |

## Ports

| Symptom | Fix |
|---------|-----|
| Port 10744/10745 already in use (zombie process) | `stop.bat` (clears 10745/10744) or start via `start.ps1` which clears ports first. |
| Two backends on 10745 | Only one backend may bind 10745 — NSSM service and Tauri must not both run. Stop one. |
| Legacy 10764/10765/5180/5181 references | Those are stale (deleted `web_sota` runt + prior migration). Use 10744 (frontend) / 10745 (backend) / 18789 (Gateway). |

## MCP client

| Symptom | Fix |
|---------|-----|
| "ModuleNotFoundError: no module named openclaw_molt_mcp" | Set `env.PYTHONPATH` to `<REPO_ROOT>/src` in the MCP client config (see INSTALL.md "MCP config snippet"). |
| Tool calls time out | Ensure the Gateway is reachable and `OPENCLAW_GATEWAY_TOKEN` matches the Gateway `gateway.authToken`. |

## Moltbook

| Symptom | Fix |
|---------|-----|
| `clawd_moltbook(operation="post")` rejected | Rate limit: **1 post / 30 min**. Wait, or use `comment` (1 / 20 s) / `upvote`. |
| 401 on all Moltbook calls | `MOLTBOOK_API_KEY` missing/invalid, or URL dropped `www`. Keep `www` in the base URL. |
| Search requires a query | `operation="search"` needs `query`. |

## Code / build

| Symptom | Fix |
|---------|-----|
| `ruff check` fails | `uv run ruff check .` then `uv run ruff format --check .` |
| `pyright` reports errors | `uv run pyright src` (and `pyright webapp_api`). See [DEVELOPMENT.md](DEVELOPMENT.md). |
| `pytest` fails coverage | `uv run pytest --cov=openclaw_molt_mcp` — floor is 40%. |
| Webapp build fails | In `webapp/`: `bun run lint`, `bun run type-check`, `bun run build`. |
| `@tauri-apps/api` missing | It is a webapp dep; `bun install` in `webapp/`. Only used when running inside the Tauri shell. |

## Logs

- MCP server: JSON lines to stderr + rotating file under `OPENCLAW_LOG_DIR`
  (default `~/.openclaw-molt-mcp/logs/openclaw-molt-mcp.log`).
- Webapp Logger modal: run `.\scripts\serve_logs.ps1` (default `http://127.0.0.1:8765`), then Refresh.
- Set `OPENCLAW_LOG_LEVEL=DEBUG` for verbose output.

## Something else

Open a GitHub issue: <https://github.com/sandraschi/openclaw-molt-mcp/issues>
