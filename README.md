# openclaw-molt-mcp

<p align="center">
  <a href="https://github.com/casey/just"><img src="https://img.shields.io/badge/just-ready_to_go-7c5cfc?style=flat-square&logo=just&logoColor=white" alt="Just"></a>
  <a href="https://github.com/astral-sh/ruff"><img src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json" alt="Ruff"></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.13+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"></a>
  <a href="https://biomejs.dev"><img src="https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat-square&logo=biome&logoColor=white" alt="Biome"></a>
  <a href="https://github.com/PrefectHQ/fastmcp"><img src="https://img.shields.io/badge/FastMCP-3.2-7c5cfc?style=flat-square" alt="FastMCP"></a>
</p>

**MCP server + webapp** that bridge Cursor and Claude Desktop to **OpenClaw** and **Moltbook**. openclaw-molt-mcp *uses* those platforms (Gateway, APIs); it does not implement or replace them. Alpha. Ingest for LLMs: [gitingest.com/sandraschi/openclaw-molt-mcp](https://gitingest.com/sandraschi/openclaw-molt-mcp).

## What this repo is

| Part | What it does |
|------|----------------|
| **MCP server** (stdio) | FastMCP 3.1.0+ tools: agent, sessions, channels, routing, skills, gateway, security, moltbook. For Cursor/Claude Desktop. |
| **Webapp** (React + Vite + Tailwind) | Dashboard on port 5180: Startpage, AI (Ollama), Channels, Routes, Diagram, Statistics, Moltbook, Integrations, Clawnews, Skills, Security, **Generate landing** (landing-site generator), Settings. |
| **webapp_api** (FastAPI) | Backend on 5181: /api/ask, /api/gateway/status, /api/skills, /api/clawnews, /api/ollama/*, /api/channels, /api/routing, /api/openclaw/status, /api/landing-page. |

One place to run agents, manage channels/routes/skills, and use Moltbook; OpenClaw and Moltbook stay separate.

## Quick Start

```powershell
git clone https://github.com/sandraschi/openclaw-molt-mcp
cd openclaw-molt-mcp
just
```

This opens an interactive dashboard showing all available commands. Run `just bootstrap` to install dependencies, then `just serve` or `just dev` to start.

### Manual Setup

If you don't have `just` installed:


## Install & run

**Clone-based** or **MCPB Bundle**. See **[INSTALL.md](INSTALL.md)** for: clone repo, install from source, MCP only or webapp (API + frontend), one-shot scripts, config, logging, checks.
- **MCPB**: A standard `openclaw-molt-mcp.mcpb` bundle is available for one-click import into compliant clients.

## Repo layout

- **src/openclaw_molt_mcp/**  MCP server and tools
- **webapp/**  React dashboard (port 5180)
- **webapp_api/**  FastAPI backend (port 5181)
- **scripts/**  install.ps1, install.bat, start.ps1, start.bat, check.ps1, serve_logs.ps1, mcpb-build.ps1
- **snippets/**  MCP config snippet (snippets/mcp-config-openclaw-molt-mcp.json); see [INSTALL.md](INSTALL.md) and [mcp-central-docs pattern](https://github.com/sandraschi/mcp-central-docs/blob/main/docs/patterns/MCP_CLIENT_CONFIG_SNIPPETS.md)

[Architecture](docs/ARCHITECTURE.md)  data flow, MCP vs API.

## Docs

| Doc | Description |
|-----|-------------|
| [LICENSE](LICENSE) | MIT license |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [INSTALL.md](INSTALL.md) | Install, run, config, checks |
| [docs/README_INDEX.md](docs/README_INDEX.md) | Doc index |
| [docs/README_WEBAPP.md](docs/README_WEBAPP.md) | Webapp pages, API, Logger |
| [docs/README_openclaw_molt_mcp_TOOLS.md](docs/README_openclaw_molt_mcp_TOOLS.md) | MCP tools |
| [docs/README_OPENCLAW.md](docs/README_OPENCLAW.md) | OpenClaw (external) |
| [docs/README_MOLTBOOK.md](docs/README_MOLTBOOK.md) | Moltbook (external) |
| [docs/HOW_THIS_WAS_MADE.md](docs/HOW_THIS_WAS_MADE.md) | How this was made (vibecode, Cursor, one day) |
| [SECURITY.md](SECURITY.md) | Threats, hardening |

## Security

OpenClaw has major security risks. Use **clawd_security**; prefer VM and loopback. [SECURITY.md](SECURITY.md), [docs/SECURITY_HARDENING.md](docs/SECURITY_HARDENING.md).

## Repo manifests (LLM scrapers)

| File | Triggers | Purpose |
|------|----------|---------|
| **glama.json** | [Glama](https://glama.ai) GitHub scraper | MCP server listing: claim ownership, metadata, Docker, usage. Requires `$schema` + `maintainers` (GitHub usernames). Re-run claim flow on Glama after changes. |
| **llms.txt** | [Gitingest](https://gitingest.com), [llmstxt.org](https://llmstxt.org) | LLM-friendly manifest: H1 + blockquote summary + ## sections with links. Improves repo ingestion for LLMs (e.g. `gitingest.com/sandraschi/openclaw-molt-mcp`). |

Other scrapers: no extra files needed. Gitingest ingests the repo (replace `github.com` with `gitingest.com` in the repo URL); llms.txt gives it a curated entry point. Glama is the main MCP-directory scraper that uses glama.json; others (e.g. Cursors MCP discovery) may crawl GitHub without a manifest.

## References

- [openclaw.ai](https://openclaw.ai)  [moltbook.com](https://moltbook.com)  [docs.openclaw.ai](https://docs.openclaw.ai)
- [mcp-central-docs/openclaw-moltbook](https://github.com/sandraschi/mcp-central-docs/tree/main/integrations/openclaw-moltbook)

---

*This README is formatted to render well on the GitHub repo page (pretty-printed).*


##  Installation

### Prerequisites
- [uv](https://docs.astral.sh/uv/) installed (RECOMMENDED)
- Python 3.12+

###  Quick Start
Run immediately via `uvx`:
```bash
uvx openclaw-molt-mcp
```

###  Claude Desktop Integration
Add to your `claude_desktop_config.json`:
```json
"mcpServers": {
  "openclaw-molt-mcp": {
    "command": "uv",
    "args": ["--directory", "D:/Dev/repos/openclaw-molt-mcp", "run", "openclaw-molt-mcp"]
  }
}
```


## 🛡️ Industrial Quality Stack

This project adheres to **SOTA 14.1** industrial standards for high-fidelity agentic orchestration:

- **Python (Core)**: [Ruff](https://astral.sh/ruff) for linting and formatting. Zero-tolerance for `print` statements in core handlers (`T201`).
- **Webapp (UI)**: [Biome](https://biomejs.dev/) for sub-millisecond linting. Strict `noConsoleLog` enforcement.
- **Protocol Compliance**: Hardened `stdout/stderr` isolation to ensure crash-resistant JSON-RPC communication.
- **Automation**: [Justfile](./justfile) recipes for all fleet operations (`just lint`, `just fix`, `just dev`).
- **Security**: Automated audits via `bandit` and `safety`.
