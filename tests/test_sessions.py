"""Tests for clawd_sessions tool."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import extract_tool_result


@pytest.mark.asyncio
async def test_clawd_sessions_list_success(mcp_client) -> None:
    """clawd_sessions list should return success with sessions."""
    with patch("openclaw_molt_mcp.tools.sessions.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.tools_invoke = AsyncMock(
            return_value={
                "success": True,
                "message": "Tool invoked successfully.",
                "data": {"sessions": [{"id": "main", "name": "Main"}]},
            }
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_sessions",
            arguments={"operation": "list", "session_key": "main"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        mock_client.tools_invoke.assert_called_once_with(
            tool="sessions_list",
            action="json",
            args={},
            session_key="main",
        )


@pytest.mark.asyncio
async def test_clawd_sessions_history(mcp_client) -> None:
    """clawd_sessions history should invoke sessions_history."""
    with patch("openclaw_molt_mcp.tools.sessions.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.tools_invoke = AsyncMock(
            return_value={"success": True, "data": {"messages": []}}
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_sessions",
            arguments={"operation": "history", "session_key": "main", "args": {"limit": 10}},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        mock_client.tools_invoke.assert_called_once_with(
            tool="sessions_history",
            action="json",
            args={"limit": 10},
            session_key="main",
        )
