# Configuration

openclaw-molt-mcp reads configuration from **environment variables** via
pydantic-settings (see `src/openclaw_molt_mcp/config.py`). The webapp can also be
configured at runtime via the **Settings** page.

Config is loaded from:
1. Process environment variables (highest priority), prefix `OPENCLAW_`.
2. A `.env` file in the repo root (gitignored). Copy `.env.example` and fill it in.

## MCP server variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPENCLAW_GATEWAY_URL` | `http://127.0.0.1:18789` | OpenClaw Gateway HTTP base URL |
| `OPENCLAW_GATEWAY_TOKEN` | *(none)* | Bearer token for Tools Invoke / Webhooks |
| `MOLTBOOK_API_KEY` | *(none)* | Moltbook agent API key (alias: `OPENCLAW_MOLTBOOK_API_KEY`) |
| `OPENCLAW_MOLTBOOK_URL` | `https://www.moltbook.com/api/v1` | Moltbook API base. Keep `www` to preserve the `Authorization` header |
| `OPENCLAW_OPENCLAW_PATH` | `openclaw` | Path to the OpenClaw CLI binary |
| `OPENCLAW_WORKSPACE_PATH` | *(none)* | OpenClaw workspace root (default `~/.openclaw/workspace`) |
| `OPENCLAW_LOG_DIR` | `~/.openclaw-molt-mcp/logs` | Log file directory (rotating) |
| `OPENCLAW_LOG_LEVEL` | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `OPENCLAW_LOG_MAX_BYTES` | `2097152` | Max bytes per rotating log file |
| `OPENCLAW_LOG_BACKUP_COUNT` | `3` | Number of backup log files kept |
| `BASTIO_API_KEY` | *(none)* | Used by `clawd_bastion(operation="status")` |

## Webapp API variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `WEBAPP_API_KEY` | *(none)* | When set, requires `X-API-Key` on non-health API endpoints |
| `OLLAMA_BASE` | `http://localhost:11434` | Ollama base URL for the webapp proxy |
| `LM_STUDIO_URL` | `http://localhost:1234` | LM Studio base URL (used by `/api/llm/discover`) |
| `CLAWD_LOG_SERVER_URL` | `http://127.0.0.1:8765` | Log server URL for the webapp Logger modal |
| `CLAWD_LOG_SERVER_PORT` | `8765` | Log server listen port |
| `CLAWD_LOG_SERVER_HOST` | `127.0.0.1` | Log server listen host |
| `CLAWD_LOG_CORS_ORIGIN` | `http://localhost:10744` | Log server CORS origin override |
| `LANDING_PAGE_OUTPUT_DIR` | `./generated` | Starter/landing page output directory |

## Launcher / ports

`fleet-start.config.ps1` at the repo root defines the webapp ports and backend
target used by `start.ps1`. Current ports:

| Port | Service |
|------|---------|
| 10744 | Vite frontend |
| 10745 | FastAPI backend + static SPA |
| 18789 | OpenClaw Gateway (external) |

## Security notes

- **Never commit `.env`.** It contains tokens. `.env` is gitignored; `.env.example` is the committed template.
- Keep `OPENCLAW_GATEWAY_URL` on `127.0.0.1` unless you deliberately expose the Gateway.
- When `WEBAPP_API_KEY` is set, the webapp API rejects requests without a matching `X-API-Key`.
