"""Basic server tests."""

from openclaw_molt_mcp import __version__
from openclaw_molt_mcp.mcp_instance import mcp


def test_mcp_instance_exists() -> None:
    """MCP instance should exist."""
    assert mcp is not None


def test_mcp_version() -> None:
    """MCP version should be set."""
    assert __version__ == "0.1.0"


def test_mcp_has_name() -> None:
    """MCP instance should have name."""
    assert mcp.name == "openclaw-molt-mcp"
