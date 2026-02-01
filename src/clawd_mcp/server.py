"""clawd-mcp FastMCP server entry point."""

import logging
import os
import sys

from clawd_mcp.mcp_instance import mcp
from clawd_mcp.tools import agent, gateway, moltbook, security, sessions, skills

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# Tools register via @mcp.tool() on import

# Optional: mount virtualization-mcp for sandbox provisioning (CLAWD_MOUNT_VBOX=1)
if os.environ.get("CLAWD_MOUNT_VBOX", "").lower() in ("1", "true", "yes"):
    try:
        from fastmcp.client import Client
        from fastmcp.client.transports import StdioTransport
        from fastmcp.server.proxy import FastMCPProxy

        def _vbox_client_factory():
            return Client(
                StdioTransport(
                    command=sys.executable,
                    args=["-m", "virtualization_mcp"],
                )
            )

        vbox_proxy = FastMCPProxy(
            client_factory=_vbox_client_factory,
            name="vbox",
        )
        mcp.mount(vbox_proxy, namespace="vbox")
        logging.getLogger(__name__).info("virtualization-mcp mounted at vbox_*")
    except Exception as e:
        logging.getLogger(__name__).warning("Could not mount virtualization-mcp: %s", e)
