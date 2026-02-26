"""Tests for clawd_gateway tool."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import extract_tool_result


@pytest.mark.asyncio
async def test_clawd_gateway_status_success(mcp_client) -> None:
    """clawd_gateway status should return success when Tools Invoke succeeds."""
    with patch("openclaw_molt_mcp.tools.gateway.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.tools_invoke = AsyncMock(
            return_value={"success": True, "data": {"sessions": []}}
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_gateway",
            arguments={"operation": "status"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        assert "reachable" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_clawd_gateway_status_failure(mcp_client) -> None:
    """clawd_gateway status should return failure when Tools Invoke fails."""
    with patch("openclaw_molt_mcp.tools.gateway.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.tools_invoke = AsyncMock(
            return_value={"success": False, "message": "Connection refused"}
        )
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_gateway",
            arguments={"operation": "status"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is False
        assert "unreachable" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_clawd_gateway_health_success(mcp_client) -> None:
    """clawd_gateway health should return success when Tools Invoke succeeds."""
    with patch("openclaw_molt_mcp.tools.gateway.GatewayClient") as mock_gateway_class:
        mock_client = MagicMock()
        mock_client.tools_invoke = AsyncMock(return_value={"success": True})
        mock_client.close = AsyncMock()
        mock_gateway_class.return_value = mock_client

        result = await mcp_client.call_tool(
            "clawd_gateway",
            arguments={"operation": "health"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        assert "healthy" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_clawd_gateway_doctor_success(mcp_client) -> None:
    """clawd_gateway doctor should run openclaw doctor subprocess."""
    with patch("openclaw_molt_mcp.tools.gateway.asyncio.create_subprocess_exec") as mock_exec:
        mock_proc = MagicMock()
        mock_proc.communicate = AsyncMock(return_value=(b"stdout", b""))
        mock_proc.returncode = 0
        mock_exec.return_value = mock_proc

        result = await mcp_client.call_tool(
            "clawd_gateway",
            arguments={"operation": "doctor"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is True
        assert "doctor" in data.get("message", "").lower()
        mock_exec.assert_called_once()


@pytest.mark.asyncio
async def test_clawd_gateway_doctor_cli_not_found(mcp_client) -> None:
    """clawd_gateway doctor should return error when openclaw not found."""
    with patch("openclaw_molt_mcp.tools.gateway.asyncio.create_subprocess_exec") as mock_exec:
        mock_exec.side_effect = FileNotFoundError("openclaw not found")

        result = await mcp_client.call_tool(
            "clawd_gateway",
            arguments={"operation": "doctor"},
            raise_on_error=False,
        )
        data = extract_tool_result(result)
        assert data.get("success") is False
        assert "not found" in data.get("message", "").lower()
