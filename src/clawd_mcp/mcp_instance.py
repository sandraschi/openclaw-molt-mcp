"""Shared FastMCP instance for clawd-mcp."""

from fastmcp import FastMCP

from clawd_mcp import __version__

mcp = FastMCP(name="clawd-mcp", version=__version__)
