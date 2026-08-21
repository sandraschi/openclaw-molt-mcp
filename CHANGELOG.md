# Changelog

All notable changes to openclaw-molt-mcp will be documented in this file.

## [Unreleased] - 2026-08-21

### Added

- **Webapp API endpoints**: `GET /api/capabilities` (fleet-standard runtime tool-surface introspection; 11 portmanteau tools, static registry) and `GET /api/llm/discover` (Ollama + LM Studio local provider discovery).
- **Desktop (Tauri) integration**: `@tauri-apps/api` dependency, `webapp/src/hooks/useTauri.ts` hook, and backend-status listener wired into `Health.tsx` (inert in browser dev).
- **CI**: `.github/workflows/ci.yml` (Windows-only; ruff, ruff format, pyright, pytest+cov, webapp Biome/tsc/build).
- **Quality tooling**: `pyright` dev dependency + `pyrightconfig.json`; `[tool.coverage]` with `fail_under = 40`. Enabled ruff `T20` rule (per-file-ignores for `scripts/*.py`).
- **Session-context files**: `.claude-plugin/plugin.json`, `.cursorrules`, `.windsurfrules`, `.opencode/skills/repo-standards/SKILL.md`, `.github/copilot-instructions.md`.
- **`.env.example`**: documents the full env surface (gateway, Moltbook, optional log/workspace/transport).
- **Docs stack**: `docs/` onboarding, configuration, development, tools, troubleshooting reference files (+ `docs/README.md` index), INSTALL.md onboarding callout, README docs table, refreshed `llms.txt`.

### Changed

- **Ports moved into fleet reservoir**: webapp moved off the Vite-adjacent 5180/5181 to **10744 (frontend) / 10745 (backend)**. Updated CORS (webapp_api + serve_logs), Vite proxy, fleet-start config, start/stop scripts, registries (`webapp-registry.json`, `fleet-registry.json`, `WEBAPP_PORTS.md`), and all docs. Gateway stays on its external daemon port 18789.
- **Webapp lint/format now Biome**: replaced ESLint with `@biomejs/biome` (fleet `BUN_STANDARDS.md`); `lint`/`check`/`format` scripts, `biome.json`, `.github/workflows/ci.yml`, and justfile updated. ESLint config + deps removed.
- **`web_sota` runt deleted**: legacy duplicate webapp scaffold removed; build/start scripts and justfile re-pointed to `webapp/`.
- **Tool docstrings**: all 11 portmanteau tool modules gained `## Return Format` and `## Examples` sections.
- **`AGENTS.md` rewritten**: architecture, ports, conventions, gates.

### Fixed

- **`ollama_delete` dropped request body**: `client.delete(url, json=...)` silently discards the body on httpx; switched to `client.request("DELETE", url, json={"name": name})`.
- **Secret leak**: `_llm_test_scripts/debug_settings.py` contained a hardcoded gateway token; rewritten to read from `.env`. `.gitignore` now excludes `_llm_test_scripts/` and `*.bak`/`*.bak.*`; stale `.bak` files removed.
- **Test isolation**: `tests/test_config.py` now passes `Settings(_env_file=None)` so a real `.env` doesn't leak into tests. **41/41 pass.**
- **Pyright clean**: fixed `logging_config` LogRecord extras (`getattr`), awaited `ctx.info(...)` in `agent.py`/`routing.py`, and `ContextLike` protocol in `security.py`. **0 errors.**
- **Pre-existing lint**: fixed all ruff issues in CUA smoke scripts and `serve_logs.py`.
- **Corrupted `httptools` install**: the venv's httptools had an empty/missing `HttpRequestParser` (uvicorn HTTP hung on every request, `HTTP 000`). Reinstalled the lockfile-pinned `httptools==0.7.1`; webapp now serves health/capabilities over HTTP.
- **`main.tsx`**: removed non-null assertion on `#root` (Biome-clean).

### Removed

- **ESLint** from the webapp (Biome is the single JS/TS linter/formatter).
- **`web_sota/`** legacy scaffold and its stale 10764/10765 port references.

## [0.2.1] - 2026-02-06

### Security

- **Path traversal fixes**: `clawd_skills` read operation now rejects `skill_name` with `..`, path separators, or non-alphanumeric characters. Landing page generator sanitizes `project_name` to safe slug (alphanumeric + hyphen only) and validates output path stays under target.
- **Optional API key**: Webapp API supports `WEBAPP_API_KEY` env var. When set, all endpoints except `/api/health` and `/generated` require `X-API-Key` header. Unset = local-only (no auth).
- **CORS restriction**: Log server (`serve_logs`) no longer uses `Access-Control-Allow-Origin: *`. Reflects request `Origin` only when in allowlist (localhost:5180, 5181). Override via `CLAWD_LOG_CORS_ORIGIN`.
- **openclaw_path validation**: `clawd_security` audit validates `OPENCLAW_OPENCLAW_PATH` before subprocess. Allows `openclaw`, `openclaw.exe`, or absolute paths under `/usr`, `/usr/local`, `C:\`, or user home.
- **Log redaction**: Log entries returned by `/api/logs` and serve_logs redact sensitive keys (`token`, `password`, `api_key`, `secret`, `authorization`, etc.).

### Fixed

- **Config**: `MOLTBOOK_API_KEY` env var now loads correctly (added `validation_alias` alongside `OPENCLAW_MOLTBOOK_API_KEY`).
- **Python 3.10**: Replaced `datetime.UTC` with `timezone.utc` in logging_config for 3.10 compatibility.

### Changed

- **Tests**: Migrated from `mcp.call_tool` to FastMCP `Client(transport=mcp)`. Added `mcp_client` fixture and `extract_tool_result` helper. All 41 tests pass.

## [0.2.0] - 2026-02-04

### Added
- **Functional Agent Messaging**: Implemented real `hooks/agent` integration in `GatewayClient`.
- **Active Agent Tools**: Replaced placeholders in `clawd_agent` with functional implementations for `send_message` and `run_agent`.
- **Standardized MCPB Packaging**: Added root `mcpb.json` and `.mcpbignore` for lean, standard builds.
- **Manifest Standardization**: Moved `manifest.json` to root for industry-standard packaging.

## [0.1.0] - 2026-01-30

- **OpenClaw install detection**: Webapp checks if OpenClaw CLI is installed (`GET /api/openclaw/status`); shows banner with install alternatives (naked, Docker, VM) and dismiss via localStorage. `OpenClawInstallBanner` component.
- **Startpage hero**: Hero section on Startpage (gradient, glow, responsive headline, tagline).
- **Starter page (landing-site generator)**: Webapp page **Starter page** (sidebar): form (project name, hero title e.g. "India Claw", subtitle, features, author, GitHub, donate). `POST /api/landing-page` generates static site (index, how_it_works, ecosystem, download, donate, bio, styles.css, script.js) plus `DEPLOY.md`. Output: `LANDING_PAGE_OUTPUT_DIR` or `./generated/<slug>/www/`. Adapted from meta-mcp `generate_landing_page`. `webapp_api/landing_page_service.py`, `landing_assets/`.
- **Ecosystem page in generated site**: Generated landing sites include `ecosystem.html` (nav link **Ecosystem**) with structured info: OpenClaw, openclaw-molt-mcp + webapp, Moltbook (descriptions + links); news/coverage (TechCrunch, The Verge, Bitdoze, docs); reviewers (Matthew Berman YT, Simon Willison, AI Explained). Constants in `landing_page_service.py`.
- **Remove OpenClaw off-ramp**: INSTALL.md section **Removing OpenClaw** (stop Gateway, disconnect openclaw-molt-mcp, uninstall CLI, remove config). Webapp **Security** page: **Remove OpenClaw** section with steps and link to doc. MCP tool **clawd_openclaw_disconnect** returns steps and doc link (no side effects). SECURITY.md and SECURITY_HARDENING.md link to Removing OpenClaw.
- **INSTALL.md**: Install and run moved from README to INSTALL.md (MCP-only, webapp API + frontend, one-shot scripts, config table, logging, checks).
- **llms.txt and glama.json**: Repo-root manifests for LLM scrapers. `llms.txt` (llmstxt.org): H1, blockquote, ## Core/MCP & Webapp/External/Optional with links. `glama.json` (Glama MCP listing): `$schema` + `maintainers: ["sandraschi"]`. README section **Repo manifests (LLM scrapers)** documents triggers (Glama, Gitingest).
- Extensive testing scaffold: conftest, test_config, test_gateway_client, test_agent, test_gateway_tool, test_sessions, test_skills, test_server
- mypy and ruff config in pyproject.toml
- scripts/check.ps1 and justfile for lint, typecheck, test
- pre-commit hooks for ruff and mypy
- Git repository initialized
- Initial scaffold: FastMCP 2.14+ MCP server
- Portmanteau tools: clawd_agent, clawd_sessions, clawd_skills, clawd_gateway
- Dialogic tool returns (success, message, data)
- MCPB packaging with extensive prompts (system, user, quick-start, configuration, troubleshooting, examples)
- Monorepo with React + Tailwind dark webapp
- Gateway client for Tools Invoke and Webhooks API

### Changed

- **scripts/start.ps1**: Kills processes on 5181/5180 and **closes their parent PowerShell windows**; kills **watchfiles** (uvicorn --reload) only when the process command line contains this project root (other webapps' watchers are left alone).
- **README**: Compact, info-dense; **What this repo is** table (MCP server, Webapp, webapp_api); install → INSTALL.md; Repo layout; Docs table; Repo manifests section. Clarified: openclaw-molt-mcp *uses* OpenClaw/Moltbook, does not implement or replace them.
- **Startpage**: Hero section (gradient card, responsive headline, tagline).
- **Webapp sidebar**: Added **Starter page** (Globe icon), route `/starter`.
