"""clawd_sessions: Session discovery and agent-to-agent coordination."""

import logging
from typing import Any, Literal

from fastmcp import Context

from clawd_mcp.mcp_instance import mcp

from clawd_mcp.gateway_client import GatewayClient
from clawd_mcp.config import Settings

logger = logging.getLogger(__name__)


@mcp.tool()
async def clawd_sessions(
    ctx: Context,
    operation: Literal["list", "history", "send"],
    session_key: str = "main",
    args: dict[str, Any] | None = None,
) -> dict:
    """
    OpenClaw session operations (agent-to-agent coordination).

    **Operations:**
    - `list`: List active sessions (agents) and metadata via sessions_list tool.
    - `history`: Fetch transcript for a session via sessions_history tool.
    - `send`: Message another session via sessions_send tool (agent-to-agent).

    **Dialogic returns**: Natural language message plus structured data.

    Requires OpenClaw Gateway with Tools Invoke API and OPENCLAW_GATEWAY_TOKEN.
    """
    settings = Settings()
    client = GatewayClient(settings)
    tool_map = {"list": "sessions_list", "history": "sessions_history", "send": "sessions_send"}
    tool_name = tool_map.get(operation)

    if not tool_name:
        return {"success": False, "message": f"Unknown operation: {operation}"}

    try:
        result = await client.tools_invoke(
            tool=tool_name,
            action="json",
            args=args or {},
            session_key=session_key,
        )
        return result
    finally:
        await client.close()
