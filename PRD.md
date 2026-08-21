# openclaw-molt-mcp - Product Requirements Document

**Status:** ACTIVE (v0.1.0)
**Package version:** **0.1.0** (`pyproject.toml`)
**Owner:** Sandra Schieder
**Ports:** **10744** (webapp frontend) / **10745** (webapp API) / **18789** (OpenClaw Gateway, external daemon port)
**Category:** Dev / agent tooling

---

## Overview

FastMCP server + webapp that bridges **Claude Desktop / Cursor** to **OpenClaw** (agent
runtime: gateway, channels, routing, sessions, skills, security) and **Moltbook**
(AI-agent social network). openclaw-molt-mcp *uses* those platforms via their HTTP
APIs; it does not implement or replace them.

## Problem Statement

Sandra runs OpenClaw as a local agent runtime and Moltbook as the agent social layer.
Neither exposes a first-class MCP surface that Claude Desktop / Cursor can drive
directly. Managing sessions, channels, routing rules, skills, security audits, and
Moltbook posts from an IDE chat is manual and fragmented.

## Target Audience

- Sandra (primary) - drive OpenClaw + Moltbook from Claude Desktop / Cursor chat
- AI agents - automate gateway/session/skill operations via MCP tools
- fleet-agent-mcp - surface openclaw-molt-mcp tool surface for orchestration

## Delivery Legs

| Leg | Path / artifact | Role |
|-----|-----------------|------|
| 1 - MCP | `src/devices_mcp/` tools, stdio server | FastMCP tools for the gateway + Moltbook |
| 2 - Webapp | `webapp/` (React + Vite + TS, :10744) + `webapp_api/` (FastAPI, :10745) | Dashboard: Health, AI/Ollama, Channels, Routes, Diagram, Statistics, Moltbook, Starter, Settings |
| 3 - Desktop | `native/` (Tauri 2 + PyInstaller sidecar -> NSIS) | Wrapped desktop app (in progress) |

## Success Metrics

| Metric | Target |
|--------|--------|
| MCP tool surface | 11 portmanteau tools, each with an `operation` enum |
| Every advertised operation works | No `planned`/stub ops (dry-run short-circuit OK) |
| Webapp serves over HTTP | `GET /api/health` and `GET /api/capabilities` return 200 |
| Quality gates green | ruff, pyright (0 errors), pytest >= 41 pass, Biome, tsc, build |
| Fleet port compliance | Frontend/backend on 10700-11500 reservoir (10744/10745) |

## Feature Requirements

### MCP (leg 1)

- `clawd_agent` - send messages / run agents on the OpenClaw gateway
- `clawd_sessions` - list and manage gateway sessions
- `clawd_channels` - gateway channels
- `clawd_routing` - routing rules + config fallback
- `clawd_skills` - list/read skills (path-traversal hardened)
- `clawd_gateway` - gateway health / status
- `clawd_security` - run full security audit (OpenClaw path validated)
- `clawd_bastion` - bastion / isolation helpers
- `clawd_moltbook` - Moltbook posts, comments, profile, DMs, semantic search
- `clawd_openclaw_disconnect` - off-ramp: steps to remove OpenClaw (no side effects)
- `clawd_voice` - voice / wake command helpers

### Webapp (leg 2)

- Health / status page with device table + autodiscover
- AI page: local LLM proxy (Ollama `:11434`, LM Studio)
- Channels, Routes, Diagram (mermaid), Statistics, Moltbook pages
- Integrations, Clawnews, Skills, Security pages
- Starter page: static landing-site generator (`POST /api/landing-page`)
- Settings: Logging + Local LLM provider sections
- `/api/capabilities` runtime tool-surface introspection

### Desktop (leg 3, in progress)

- Tauri 2 shell + PyInstaller backend sidecar
- Reuses existing `:10745` listener when NSSM service already runs
- CORS for `tauri://localhost` origins

## Non-Functional Requirements

- **Stack**: FastMCP 3.4+ (MCP), FastAPI (webapp API), React/Vite/TS + Tailwind + Zustand (webapp), Tauri 2 (desktop)
- **Python**: `uv run` (never naked python); **JS**: `bun` (never npm)
- **Lint/format**: ruff (Python), Biome (JS/TS)
- **Type check**: pyright (0 errors)
- **Config**: pydantic-settings + `.env` (gitignored); `.env.example` documents keys
- **Ports**: webapp on 10744/10745 (fleet reservoir); Gateway external on 18789
- **Packaging**: MCPB (`.mcpb`) two-track + NSIS desktop installer

## Out of Scope

- Implementing OpenClaw or Moltbook themselves (openclaw-molt-mcp bridges them)
- Cloud-hosted backend (local-first)

## Current Status

- **MCP**: 11 tools implemented and docstring-complete
- **Webapp**: live on 10744/10745, all pages present, health + capabilities verified 200
- **Gates**: ruff, pyright (0 errors), pytest 41 pass, Biome, tsc, build all green
- **Desktop**: Tauri integration scaffolding in place (`useTauri.ts`); NSIS build pending
- **Blocked**: `MOLTBOOK_API_KEY` (user-owned secret) - Moltbook health stays 401 until set
