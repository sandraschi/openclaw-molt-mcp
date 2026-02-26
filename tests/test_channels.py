"""Tests for clawd_channels tool."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import extract_tool_result


@pytest.mark.asyncio
async def test_clawd_channels_list_channels_success(mcp_client) -> None:
    """clawd_channels list_channels should call Gateway tool channels with action list_channels."""
    with patch("openclaw_molt_mcp.tools.channels.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.tools_invoke = AsyncMock(
            return_value={
                "success": True,
                "message": "Tool invoked successfully.",
                "data": {"channels": [{"name": "whatsapp", "connected": True}]},
            }
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_channels",
            arguments={"operation": "list_channels", "session_key": "main"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        mock_client.tools_invoke.assert_called_once()
        call_kw = mock_client.tools_invoke.call_args[1]
        assert call_kw["tool"] == "channels"
        assert call_kw["action"] == "list_channels"


@pytest.mark.asyncio
async def test_clawd_channels_send_message_requires_message(mcp_client) -> None:
    """clawd_channels send_message without message returns error."""
    result = await mcp_client.call_tool(
        "clawd_channels",
        arguments={"operation": "send_message", "channel": "telegram"},
        raise_on_error=False,
    )
    data = extract_tool_result(result)
    assert data.get("success") is False
    assert "message" in (data.get("message") or "").lower()
