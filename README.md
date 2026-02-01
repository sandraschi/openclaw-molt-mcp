# clawd-mcp

**FastMCP 2.14+** server bridging Cursor and Claude Desktop with the **OpenClaw** (openclaw.ai) and **Moltbook** (moltbook.com) ecosystem.

## Overview

- **OpenClaw**: Personal AI assistant runtime; WhatsApp/Telegram/Discord gateway; Pi agent; bash, browser, cron
- **Moltbook**: Social network for AI agents; posts, comments, DMs, submolts; semantic search; heartbeat pattern
- **clawd-mcp**: MCP tools to invoke OpenClaw agents, manage sessions, skills, gateway; future Moltbook integration

## Quick Start

```bash
pip install -e ".[dev]"
python -m clawd_mcp
```

```bash
cd webapp && npm install && npm run dev
```

## Documentation

| Doc | Description |
|-----|-------------|
| [Index](docs/README_INDEX.md) | Full documentation index |
| [OpenClaw](docs/README_OPENCLAW.md) | OpenClaw platform, Gateway, channels, Pi agent, ClawHub |
| [clawd-mcp Server & Tools](docs/README_CLAWD_MCP_TOOLS.md) | MCP server, portmanteau tools, dialogic returns |
| [Webapp](docs/README_WEBAPP.md) | React + Tailwind dark dashboard |
| [Moltbook](docs/README_MOLTBOOK.md) | Moltbook site, skills, agent heartbeats |
| [Security Hardening](docs/SECURITY_HARDENING.md) | OpenClaw threats, hardening checklist, clawd_security |

## Security

OpenClaw has major security risks (exposed creds, prompt injection, malicious skills). Use `clawd_security` for audit, skill scanning, config validation, and hardening recommendations. Optional `CLAWD_MOUNT_VBOX=1` mounts virtualization-mcp for VM-based sandbox provisioning. See [docs/SECURITY_HARDENING.md](docs/SECURITY_HARDENING.md) and [Auth0](https://auth0.com/blog/five-step-guide-securing-moltbot-ai-agent/), [Intruder](https://www.intruder.io/blog/clawdbot-when-easy-ai-becomes-a-security-nightmare).

## Configuration

| Variable | Default |
|----------|---------|
| `OPENCLAW_GATEWAY_URL` | `http://127.0.0.1:18789` |
| `OPENCLAW_GATEWAY_TOKEN` | (required when auth enabled) |
| `MOLTBOOK_API_KEY` | (optional) |
| `CLAWD_MOUNT_VBOX` | `1` to mount virtualization-mcp at vbox_* (optional) |

## Checks

```powershell
.\scripts\check.ps1 -All   # ruff, mypy, pytest
just check                 # same via just
```

## References

- [openclaw.ai](https://openclaw.ai)
- [moltbook.com](https://moltbook.com)
- [docs.openclaw.ai](https://docs.openclaw.ai)
- [mcp-central-docs/integrations/openclaw-moltbook](https://github.com/sandraschi/mcp-central-docs/tree/main/integrations/openclaw-moltbook)
