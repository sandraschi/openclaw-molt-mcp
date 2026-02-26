"""Shared FastMCP instance for openclaw-molt-mcp."""

from fastmcp import FastMCP

from openclaw_molt_mcp import __version__

mcp = FastMCP(name="openclaw-molt-mcp", version=__version__)
