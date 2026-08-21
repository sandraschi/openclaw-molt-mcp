# Onboarding — openclaw-molt-mcp

## What this is for

openclaw-molt-mcp is a bridge: it lets Claude Desktop / Cursor talk to **OpenClaw**
(an autonomous agent Gateway with channels, routing, sessions, and skills) and
**Moltbook** (a social network for AI agents). It does **not** include OpenClaw or
Moltbook — you must run/have them before the tools return live data. This page walks
a first-timer through the host-world setup that `uv sync` / `start.ps1` cannot do.

## Cost and accounts (money / CC)

| Question | Answer |
|----------|--------|
| Do I need an account? | **Yes** for Moltbook (agent API key). No account needed just to run the MCP/webapp. |
| Free tier? | Yes. OpenClaw is a free/open install. Moltbook has free agent access; some features are rate-limited. |
| Credit card required? | No. Nothing in this repo requires a card. |
| Ongoing cost? | Free for OpenClaw + basic Moltbook. If you route LLM calls through a hosted provider, that provider may meter. |
| Who bills? | None directly. Third-party LLM providers bill you directly if you configure one. |

## Prerequisites outside this repo

- **OpenClaw** — install the CLI and run a Gateway. See [INSTALL.md](../INSTALL.md) and [README_OPENCLAW.md](README_OPENCLAW.md). OpenClaw must be reachable at the Gateway URL (default `http://127.0.0.1:18789`).
- **Moltbook** — a Moltbook agent account and an **API key**. Get one at [moltbook.com](https://www.moltbook.com) for your agent.
- Optional **Ollama** or **LM Studio** for local chat/generation in the webapp (no account; local only).
- Windows 10/11 (development target) with PowerShell 7.

## First-timer setup steps

1. **Install the repo tooling** (`uv`, `bun`, Node) — see [INSTALL.md](../INSTALL.md).
2. **Install OpenClaw** and start its Gateway. Confirm it answers on `127.0.0.1:18789`.
3. **Create a Moltbook agent** and get an API key.
4. **Copy `.env.example` to `.env`** and fill in:
   - `OPENCLAW_GATEWAY_URL` (default `http://127.0.0.1:18789`)
   - `OPENCLAW_GATEWAY_TOKEN` (the token your Gateway uses)
   - `MOLTBOOK_API_KEY` (from Moltbook)
5. **Start the webapp**: `start.ps1`, then open `http://127.0.0.1:10744/app/`.
6. On the **Health** page, confirm Gateway, OpenClaw CLI, Moltbook, and Ollama all show green. Moltbook stays red until a valid key is set.

## Pitfalls

- **Keep `www` in `OPENCLAW_MOLTBOOK_URL`** — the API drops the `Authorization` header on non-`www` hosts. Use `https://www.moltbook.com/api/v1`.
- **Rate limits**: Moltbook is 100 req/min, **1 post / 30 min**, 1 comment / 20 s, 50 comments/day. `clawd_moltbook(operation="post")` can hit the 30-min gate.
- **Gateway bind**: keep OpenClaw bound to `127.0.0.1`, not `0.0.0.0`, unless you intentionally expose it.
- **Never commit `.env`** — it holds tokens. `.env` is gitignored; use `.env.example` for the shape.
- **Token scopes**: use a scoped/short-lived token; a leaked token can act as your agent.

## Sanity check

- `GET /api/health/aggregate` on `:10745` returns `"moltbook": {"ok": true}` once the key is valid.
- The webapp **Health** page shows all-green status rows.
- `clawd_moltbook(operation="status")` returns `{"success": true, "message": "Moltbook API reachable. Key configured."}`.
- `clawd_gateway(operation="health")` returns `{"success": true, "message": "Gateway healthy."}`.

## Declared doubles

- With no `MOLTBOOK_API_KEY`, `clawd_moltbook(operation="status")` returns `success: false` with a clear "not configured" message — **not** fake live data.
- Without a reachable Gateway, `clawd_gateway`/`clawd_agent` return `success: false` with the underlying error. There is no silent fake success.
- The webapp may show **MOCK-badged** sample KPIs until onboarding completes; these clear once health reports configured.
