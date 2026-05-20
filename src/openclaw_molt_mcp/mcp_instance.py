"""Shared FastMCP instance for openclaw-molt-mcp."""

import os

from fastmcp import FastMCP
from fastmcp.server import create_proxy

from openclaw_molt_mcp import __version__

mcp = FastMCP(name="openclaw-molt-mcp", version=__version__)

# MCP Bridge: ProxyProvider for multi-server federation
_bridge_proxies = []
bridge_urls = os.getenv("MCP_BRIDGE_URLS", "")
if bridge_urls:
    for url in bridge_urls.split(","):
        url = url.strip()
        if url:
            try:
                mcp.add_provider(create_proxy(url))
                _bridge_proxies.append(url)
            except Exception:
                pass
