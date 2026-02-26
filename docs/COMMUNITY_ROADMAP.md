# openclaw-molt-mcp Community Roadmap Plan

## Executive Summary

openclaw-molt-mcp bridges Cursor/Claude Desktop to OpenClaw (agent runtime) and Moltbook (agent social network). This plan identifies gaps, prioritizes features, and outlines implementation approaches to make it the **default control plane** for the OpenClaw community.

---

## Current State

### MCP Server (10 tools)

| Tool | Operations | Status |
|------|------------|--------|
| clawd_agent | wake, run_agent, send_message | Functional |
| clawd_sessions | list, history, send | Functional |
| clawd_channels | list, config, send, recent | Functional |
| clawd_routing | get_rules, update, test, session | Functional |
| clawd_skills | list, read | Functional (no ClawHub) |
| clawd_gateway | status, health, doctor | Functional |
| clawd_security | audit, check_skills, validate, recommend, provision | Functional |
| clawd_moltbook | feed, search, post, comment, upvote, heartbeat | Functional |
| clawd_voice | tts | Functional |
| clawd_openclaw_disconnect | steps | Functional |

### Webapp Pages

| Page | Status |
|------|--------|
| Startpage, AI, Channels, Routes, Diagram | Implemented |
| Statistics | Snapshot only; no time-series |
| Moltbook | Draft + register only; no feed/search/post |
| Integrations, Clawnews | Implemented |
| Skills | TBD placeholder |
| Security | Remove OpenClaw only; no audit UI |
| Generate (landing, MCP config) | Implemented |
| Settings | Placeholder |

---

## Proposed Features (Prioritized)

### Tier 1: High Impact, Low Effort

#### 1.1 Skills Page (Webapp)

- Call `GET /api/skills` (already exists)
- Render skill list with cards; expand to show SKILL.md content
- Add `GET /api/skills/{name}/content` or extend existing API to return content for a skill

#### 1.2 Security Audit Dashboard (Webapp)

- Add `POST /api/security/audit` proxying to `clawd_security` (audit, check_skills, validate_config, recommendations)
- Render findings in a table/cards with severity, title, description
- Link to provision_sandbox playbook

#### 1.3 Moltbook Feed and Search (Webapp)

- Add `GET /api/moltbook/feed`, `GET /api/moltbook/search?q=`
- Add `POST /api/moltbook/post`, `POST /api/moltbook/comment`, `POST /api/moltbook/upvote`
- Webapp: Feed view, search bar, post/comment/upvote actions

#### 1.4 Sessions List and History (Webapp)

- Add `POST /api/sessions` proxying to `clawd_sessions` (list, history)
- Sessions list, click to view history transcript

### Tier 2: High Impact, Medium Effort

- ClawHub integration (search, install)
- Configuration editor
- Onboarding wizard
- Moltbook Heartbeat scheduler

### Tier 3: Medium Impact, Higher Effort

- Statistics and metrics (time-series)
- Voice (TTS) UI
- Submolts and DMs
- Multi-instance support

### Tier 4: Community and Ecosystem

- Community templates
- Health dashboard (unified view)
- Clawnews RSS / auto-update
- Export/backup

---

## Implementation Order (Recommended)

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 1** | Skills page, Security audit UI, Sessions list | 1-2 weeks |
| **Phase 2** | Moltbook feed/search/post, Onboarding wizard, Health dashboard | 2-3 weeks |
| **Phase 3** | ClawHub integration, Config editor, Heartbeat scheduler | 3-4 weeks |
| **Phase 4** | Statistics/metrics, Voice UI, Submolts/DMs, Export/backup | 4-6 weeks |
| **Phase 5** | Multi-instance, Community templates, Clawnews RSS | 6-8 weeks |

---

## Dependencies and Risks

- **ClawHub API**: If no public API, install may require subprocess `clawhub install`
- **Moltbook rate limits**: 1 post/30min, 1 comment/20sec; UI should enforce and display countdown
- **Config write safety**: Always backup before write; validate JSON/YAML
- **Multi-instance**: Breaking change to env/config; needs migration path for existing users
