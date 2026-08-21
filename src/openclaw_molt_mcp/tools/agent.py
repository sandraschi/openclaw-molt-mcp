"""clawd_agent: Agent invocation and messaging (OpenClaw)."""

import logging
from typing import Literal

from fastmcp import Context

from openclaw_molt_mcp.config import Settings
from openclaw_molt_mcp.gateway_client import GatewayClient
from openclaw_molt_mcp.mcp_instance import mcp

logger = logging.getLogger(__name__)


@mcp.tool()
async def clawd_agent(
    ctx: Context,
    operation: Literal["send_message", "run_agent", "wake"],
    message: str = "",
    session_key: str = "main",
    channel: Literal["last", "whatsapp", "telegram", "discord", "slack"] | None = None,
    to: str | None = None,
    deliver: bool = False,
    thinking: Literal["off", "minimal", "low", "medium", "high", "xhigh"] | None = None,
    timeout_seconds: int | None = None,
) -> dict:
    """
    Invoke OpenClaw agent operations.

    **Operations:**
    - `send_message`: Send message to agent; optionally deliver response to channel.
    - `run_agent`: Run isolated agent turn; return response to MCP (no channel delivery).
    - `wake`: Trigger heartbeat / wake main session with system event.

    **Dialogic returns**: Natural language message plus structured data.

    ## Return Format

    Returns a dict with:
    - `success` (bool): Whether the operation completed.
    - `message` (str): Human-readable summary.
    - `data` (dict, optional): Response payload from the Gateway (run_agent/send_message).
    On error, `error` (str) is included and `success` is False.

    ## Examples

    ```
    clawd_agent(operation="send_message", message="What's the weather?", deliver=False)
    # {"success": true, "message": "...", "data": {"response": "..."}}

    clawd_agent(operation="wake", message="Heartbeat")
    # {"success": true, "message": "Wake triggered via openclaw-molt-mcp", "data": {...}}
    ```

    Requires OpenClaw Gateway running at OPENCLAW_GATEWAY_URL with OPENCLAW_GATEWAY_TOKEN
    when gateway auth is enabled. Webhooks require hooks.enabled and hooks.token in config.
    """
    settings = Settings()
    client = GatewayClient(settings)

    try:
        if operation == "wake":
            text = message or "Wake triggered via openclaw-molt-mcp"
            result = await client.hooks_wake(text=text, mode="now")
            return result

        if operation == "run_agent":
            await ctx.info("Running isolated agent turn (deliver=False)")
            result = await client.hooks_agent(
                message=message or "Isolated run triggered via openclaw-molt-mcp",
                session_key=session_key,
                deliver=False,
            )
            return result

        if operation == "send_message":
            await ctx.info("Sending message to agent")
            result = await client.hooks_agent(
                message=message,
                session_key=session_key,
                deliver=deliver,
                channel=channel,
                to=to,
            )
            return result

        return {
            "success": False,
            "message": f"Unknown operation: {operation}",
        }
    except Exception as e:
        logger.error(
            "clawd_agent failed: %s",
            e,
            extra={"tool": "clawd_agent", "operation": operation, "error_type": type(e).__name__},
            exc_info=True,
        )
        return {
            "success": False,
            "message": f"Agent operation failed: {e!s}",
            "error": str(e),
        }
    finally:
        await client.close()
