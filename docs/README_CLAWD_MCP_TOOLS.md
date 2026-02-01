# clawd-mcp Server and Tools

**FastMCP 2.14+** MCP server exposing OpenClaw and (future) Moltbook operations to Cursor, Claude Desktop, and other MCP clients.

## Architecture

```
MCP Clients (Cursor, Claude Desktop)
    |
    v
clawd-mcp (stdio)
    |
    +-- clawd_agent     -> OpenClaw Gateway (Tools Invoke, Webhooks)
    +-- clawd_sessions  -> OpenClaw Gateway (sessions_*)
    +-- clawd_skills    -> Local workspace + ClawHub
    +-- clawd_gateway   -> Gateway health + openclaw doctor
    +-- clawd_security  -> Audit, skill scan, hardening, provision_sandbox
    +-- clawd_moltbook  -> Feed, search, post, comment, upvote, heartbeat
    |
    v
OpenClaw Gateway (HTTP :18789)
```

## Tool Design

### Portmanteau Pattern

Tools are consolidated into logical groups. Each tool has an `operation` parameter to select the action. Reduces tool explosion while keeping full functionality.

### Dialogic Returns

All tools return:

```json
{
  "success": true,
  "message": "Natural language summary for the user",
  "data": { ... }
}
```

Use `message` for conversational replies; use `data` for structured processing.

### Context Usage

Tools accept `ctx: Context` for `ctx.info()` logging and `ctx.report_progress()`.

---

## Tools Reference

### clawd_agent

Agent invocation and messaging.

| Operation | Description | Backend |
|-----------|-------------|---------|
| `wake` | Trigger heartbeat / wake main session | `POST /hooks/wake` |
| `run_agent` | Run isolated agent turn; return to MCP | `POST /hooks/agent` (deliver: false) — *pending* |
| `send_message` | Send message to agent; optionally deliver to channel | `POST /hooks/agent` — *pending* |

**Parameters**: `operation`, `message`, `session_key`, `channel`, `to`, `deliver`, `thinking`, `timeout_seconds`

---

### clawd_sessions

Session discovery and agent-to-agent coordination.

| Operation | Description | Backend |
|-----------|-------------|---------|
| `list` | List active sessions (agents) and metadata | `POST /tools/invoke` tool: `sessions_list` |
| `history` | Fetch transcript for a session | `POST /tools/invoke` tool: `sessions_history` |
| `send` | Message another session (agent-to-agent) | `POST /tools/invoke` tool: `sessions_send` |

**Parameters**: `operation`, `session_key`, `args`

---

### clawd_skills

Skills management.

| Operation | Description | Backend |
|-----------|-------------|---------|
| `list` | List installed skills in workspace | Read `workspace/skills/` |
| `read` | Read SKILL.md content for a skill | File read |

**Parameters**: `operation`, `skill_name`, `workspace_path`

**Future**: `search` (ClawHub), `install`, `sync` (Advanced Memory)

---

### clawd_gateway

Gateway status and health.

| Operation | Description | Backend |
|-----------|-------------|---------|
| `status` | Gateway reachable? Tools Invoke probe | `POST /tools/invoke` sessions_list |
| `health` | Health check | Same |
| `doctor` | Run `openclaw doctor` | Subprocess |

**Parameters**: `operation`

---

### clawd_security

OpenClaw security audit and hardening (Auth0, Intruder).

| Operation | Description | Backend |
|-----------|-------------|---------|
| `audit` | Gateway bind, auth, token, doctor | HTTP + subprocess |
| `check_skills` | Scan workspace skills for suspicious patterns | File scan |
| `validate_config` | Validate gateway.bind, allowFrom, tools.allow | JSON config |
| `recommendations` | Return hardening checklist | Static |
| `provision_sandbox` | Orchestration playbook for VM sandbox (virtualization-mcp) | Static |

**Parameters**: `operation`, `workspace_path` (optional)

**Optional mount**: `CLAWD_MOUNT_VBOX=1` mounts virtualization-mcp at `vbox_*` for VM provisioning.

See [SECURITY_HARDENING.md](SECURITY_HARDENING.md).

---

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCLAW_GATEWAY_URL` | Gateway HTTP base | `http://127.0.0.1:18789` |
| `OPENCLAW_GATEWAY_TOKEN` | Bearer token for Tools Invoke / Webhooks | (none) |
| `OPENCLAW_OPENCLAW_PATH` | Path to openclaw CLI | `openclaw` |
| `MOLTBOOK_API_KEY` | Moltbook agent API key | (none) |
| `OPENCLAW_MOLTBOOK_URL` | Moltbook API base | `https://www.moltbook.com/api/v1` |

---

## Run

```bash
python -m clawd_mcp
```

Add to Cursor/Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "clawd-mcp": {
      "command": "python",
      "args": ["-m", "clawd_mcp"],
      "cwd": "D:\\Dev\\repos\\clawd-mcp"
    }
  }
}
```

---

## MCPB Packaging

Extensive prompt templates in `mcpb/assets/prompts/`:

- `system.md`, `user.md`, `quick-start.md`, `configuration.md`, `troubleshooting.md`, `examples.json`

Build: `mcpb build`
