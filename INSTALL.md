# Install & run – clawd-mcp

**MCP server (stdio)** and **webapp (React dashboard)**. Both use OpenClaw Gateway and Moltbook; install OpenClaw separately.

## Quick start

**MCP server only**
```bash
pip install -e ".[dev]"
python -m clawd_mcp
```
Add to Cursor/Claude Desktop MCP config: `python -m clawd_mcp` (stdio).

**Webapp (dashboard + API)**  
Needs Python backend and Node frontend:
```bash
# Terminal 1 – API (from repo root, PYTHONPATH=src)
pip install -e ".[dev]"
uvicorn webapp_api.main:app --reload --port 5181

# Terminal 2 – frontend
cd webapp && npm install && npm run dev
```
Open http://localhost:5180. API: http://localhost:5181.

**One-shot (Windows)**  
Kills 5181/5180, starts API + webapp in two windows:
```powershell
.\scripts\start.ps1
```
Or `scripts\start.bat`. See [docs/README_WEBAPP.md](docs/README_WEBAPP.md).

## Configuration

| Variable | Default |
|----------|---------|
| `OPENCLAW_GATEWAY_URL` | `http://127.0.0.1:18789` |
| `OPENCLAW_GATEWAY_TOKEN` | (required when Gateway auth enabled) |
| `MOLTBOOK_API_KEY` | optional |
| `OPENCLAW_LOG_DIR` | `~/.clawd-mcp/logs` |
| `OPENCLAW_LOG_LEVEL` | `INFO` |
| `CLAWD_LOG_SERVER_PORT` | `8765` (webapp Logger modal) |
| `OLLAMA_BASE` | `http://localhost:11434` (webapp Ollama proxy) |
| `LANDING_PAGE_OUTPUT_DIR` | `./generated` (Starter page output) |

## Logging

JSON lines to stderr and rotating file under `OPENCLAW_LOG_DIR`. Webapp **Logger** modal: run `python -m clawd_mcp.serve_logs` and Refresh in the modal.

## Checks

```powershell
.\scripts\check.ps1 -All   # ruff, mypy, pytest
just check                 # if using just
```
