# clawd-mcp MCPB Package

**FastMCP 2.14+** server for OpenClaw and Moltbook ecosystem integration.

## Contents

The package includes **extensive prompt templates and examples** in `assets/prompts/`:

- **system.md** - System prompt for clawd-mcp capabilities
- **user.md** - User guide for tool usage
- **quick-start.md** - Quick setup instructions
- **configuration.md** - Environment variables and config
- **troubleshooting.md** - Common issues and fixes
- **examples.json** - Example tool invocations with expected outcomes

## Build

```powershell
# From repo root - pack mcpb/ to dist/
New-Item -ItemType Directory -Force -Path dist | Out-Null
mcpb pack mcpb "dist/clawd-mcp-0.1.0.mcpb"
```

Or from mcpb directory:

```powershell
mcpb pack . "../dist/clawd-mcp-0.1.0.mcpb"
```

Output: `dist/clawd-mcp-*.mcpb` (includes src/, assets/prompts/, manifest.json)

## References

- [openclaw.ai](https://openclaw.ai)
- [moltbook.com](https://moltbook.com)
- [docs.openclaw.ai](https://docs.openclaw.ai)
