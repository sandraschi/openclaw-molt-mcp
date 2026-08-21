# Tools Reference

openclaw-molt-mcp exposes **11 MCP tools**, all following the **portmanteau pattern**:
one tool per domain with an `operation` enum parameter that selects the action.
This avoids tool explosion while keeping full functionality.

> Full narrative doc: [README_openclaw_molt_mcp_TOOLS.md](README_openclaw_molt_mcp_TOOLS.md).

## Return format

All tools return a dict:

```json
{
  "success": true,
  "message": "Natural language summary",
  "data": { "...": "structured payload" }
}
```

On failure, `success` is `false` and `error` is included.

## Tool list

| Tool | Operations | Backing |
|------|-----------|---------|
| `clawd_agent` | `send_message`, `run_agent`, `wake` | OpenClaw Gateway (Tools Invoke / Webhooks) |
| `clawd_sessions` | `list`, `history`, `send` | Gateway sessions_* tools |
| `clawd_channels` | `list_channels`, `get_channel_config`, `send_message`, `get_recent_messages` | Gateway channels tool |
| `clawd_routing` | `get_routing_rules`, `update_routing`, `test_routing`, `get_session_by_channel` | Gateway routing tool (config fallback) |
| `clawd_skills` | `list`, `read` | Local workspace + ClawHub |
| `clawd_gateway` | `status`, `health`, `doctor` | Gateway health + `openclaw doctor` CLI |
| `clawd_openclaw_disconnect` | (none — returns removal steps) | static; no side effects |
| `clawd_security` | `audit`, `check_skills`, `validate_config`, `recommendations`, `provision_sandbox` | Gateway + local workspace scan |
| `clawd_bastion` | `provision_bastio`, `provision_trylon`, `provision_llamafirewall`, `validate`, `status` | OpenClaw config merge + playbooks |
| `clawd_moltbook` | `feed`, `search`, `post`, `comment`, `upvote`, `heartbeat_run`, `heartbeat_dm`, `status` | Moltbook API |
| `clawd_voice` | `tts` | Gateway TTS tool |

## Examples

```python
# Send a message to the agent without channel delivery
clawd_agent(operation="send_message", message="Summarize the inbox", deliver=False)

# List gateway sessions
clawd_sessions(operation="list")

# Post to Moltbook (rate limited: 1 post / 30 min)
clawd_moltbook(operation="post", content="Hello from openclaw-molt-mcp")

# Run a security audit
clawd_security(operation="audit")

# Text to speech
clawd_voice(operation="tts", text="Hello from OpenClaw")
```

## Discovery

The webapp exposes `GET /api/capabilities` (returns `tool_surface.portmanteau_tools`)
and `GET /api/llm/discover` (Ollama + LM Studio providers). See
[CONFIGURATION.md](CONFIGURATION.md) and [README_WEBAPP.md](README_WEBAPP.md).

## Webapp parity

The webapp mirrors many tools via the webapp API (`POST /api/channels`, `POST /api/routing`,
`/api/gateway/status`, `/api/skills`, `/api/security/audit`, `/api/moltbook/*`).
See [README_WEBAPP.md](README_WEBAPP.md).
