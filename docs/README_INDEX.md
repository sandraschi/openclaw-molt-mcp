# clawd-mcp Documentation Index

## Overview

| Doc | Description |
|-----|-------------|
| [../README.md](../README.md) | Project overview, What this repo is (MCP + webapp), install pointer, layout, docs, repo manifests |
| [../INSTALL.md](../INSTALL.md) | Install and run: MCP-only, webapp (API + frontend), one-shot scripts, config, logging, checks |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Repo layout, MCP vs webapp API, data flow |
| [README_OPENCLAW.md](README_OPENCLAW.md) | OpenClaw platform, Gateway, channels, Pi agent, ClawHub |
| [README_CLAWD_MCP_TOOLS.md](README_CLAWD_MCP_TOOLS.md) | clawd-mcp server, tools (agent, sessions, channels, routing, skills, gateway, security, moltbook) |
| [README_WEBAPP.md](README_WEBAPP.md) | React dashboard: Startpage (hero), AI, Channels, Routes, Diagram, Statistics, Moltbook, Integrations, Clawnews, Skills, Security, Starter page, Settings; OpenClaw install banner; Logger; API endpoints |
| [README_MOLTBOOK.md](README_MOLTBOOK.md) | Moltbook site, skills, agent heartbeats |
| [../SECURITY.md](../SECURITY.md) | Security summary and link to full guide |
| [SECURITY_HARDENING.md](SECURITY_HARDENING.md) | Full guide: threats, hardening, Tailscale/Traefik, patterns, clawd_security |

Repo manifests (root): [../llms.txt](../llms.txt) (LLM-friendly manifest; Gitingest, llmstxt.org), [../glama.json](../glama.json) (Glama MCP listing). See README section **Repo manifests (LLM scrapers)**.

## By topic

- **Getting started**: [../README.md](../README.md), [../INSTALL.md](../INSTALL.md), [README_WEBAPP.md](README_WEBAPP.md) (Run, start scripts)
- **MCP server and tools**: [README_CLAWD_MCP_TOOLS.md](README_CLAWD_MCP_TOOLS.md)
- **Webapp and API**: [README_WEBAPP.md](README_WEBAPP.md) (pages, OpenClaw banner, Starter page, API endpoints, Diagram, Statistics, Moltbook, Logger)
- **OpenClaw / Moltbook**: [README_OPENCLAW.md](README_OPENCLAW.md), [README_MOLTBOOK.md](README_MOLTBOOK.md)
- **Security**: [../SECURITY.md](../SECURITY.md), [SECURITY_HARDENING.md](SECURITY_HARDENING.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/start.ps1` | PowerShell: kill 5181/5180, start API and webapp in two windows; pause on exit |
| `scripts/start.bat` | CMD: same; uses `netstat`/`taskkill` and `pause` |
| `scripts/check.ps1` | Ruff, mypy, pytest (`-All` or `-Ruff`, `-Mypy`, `-Test`) |

## External

- [openclaw.ai](https://openclaw.ai)
- [moltbook.com](https://moltbook.com)
- [docs.openclaw.ai](https://docs.openclaw.ai)
- [moltbook.com/skill.md](https://www.moltbook.com/skill.md)
- [moltbook.com/heartbeat.md](https://www.moltbook.com/heartbeat.md)
- [mcp-central-docs integrations](https://github.com/sandraschi/mcp-central-docs/tree/main/integrations/openclaw-moltbook)
