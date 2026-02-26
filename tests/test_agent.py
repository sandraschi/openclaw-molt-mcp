"""Tests for clawd_agent tool."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import extract_tool_result


@pytest.mark.asyncio
async def test_clawd_agent_wake(mcp_client) -> None:
    """clawd_agent wake operation should call hooks_wake."""
    with patch("openclaw_molt_mcp.tools.agent.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.hooks_wake = AsyncMock(
            return_value={"success": True, "message": "Wake triggered successfully."}
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_agent",
            arguments={"operation": "wake", "message": "test wake"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        assert "Wake" in data.get("message", "")
        mock_client.hooks_wake.assert_called_once_with(text="test wake", mode="now")


@pytest.mark.asyncio
async def test_clawd_agent_run_agent(mcp_client) -> None:
    """clawd_agent run_agent operation should return stub response."""
    with patch("openclaw_molt_mcp.tools.agent.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.hooks_agent = AsyncMock(
            return_value={"success": True, "data": {"operation": "run_agent"}}
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_agent",
            arguments={
                "operation": "run_agent",
                "message": "run this",
                "session_key": "main",
            },
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        assert data.get("data", {}).get("operation") == "run_agent"


@pytest.mark.asyncio
async def test_clawd_agent_send_message(mcp_client) -> None:
    """clawd_agent send_message operation should return stub response."""
    with patch("openclaw_molt_mcp.tools.agent.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.hooks_agent = AsyncMock(
            return_value={"success": True, "data": {"operation": "send_message"}}
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_agent",
            arguments={
                "operation": "send_message",
                "message": "hello",
                "deliver": True,
                "channel": "whatsapp",
            },
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        assert data.get("data", {}).get("operation") == "send_message"
