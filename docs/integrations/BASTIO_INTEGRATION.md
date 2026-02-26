# OpenClaw + Bastio.ai Integration Guide

## Overview

This guide shows how to integrate OpenClaw with Bastio.ai for comprehensive prompt injection protection. Bastio.ai acts as a security gateway that inspects every prompt before it reaches OpenClaw.

Use the **clawd_bastion** MCP tool to provision Bastio in an existing OpenClaw setup: `clawd_bastion(operation="provision_bastio", api_key="your-key")`.

## Why Bastio.ai for OpenClaw

### Critical Protection Layers
- **Prompt Injection Detection** - 14 attack patterns blocked
- **Secure Web Browsing** - Firecrawl integration prevents indirect injection
- **PII Protection** - Prevents data exfiltration
- **Bot Detection** - Blocks automated attacks

### Limitations to Understand
- **Free tier**: 10,000 "scrubs" per month
- **Evolving threats**: New injection techniques emerge constantly
- **Dependency**: Requires Bastio.ai to maintain filter updates

## Prerequisites

- **Bastio.ai account** (free tier available at [bastio.com](https://www.bastio.com))
- **OpenClaw installation** (running Gateway)
- **API key** from Bastio dashboard

## Provisioning via clawd_bastion

The `clawd_bastion` tool can merge Bastio config into your OpenClaw config:

1. **Backup**: Creates a timestamped backup of your config before writing
2. **Merge**: Adds `gateway.bastion` block to existing config
3. **Env**: Outputs `.env.example` snippet for `BASTIO_API_KEY`

**Operations:**
- `provision_bastio` - Merge Bastio config, create backup, return instructions
- `provision_trylon` - Return Trylon (self-hosted) playbook
- `provision_llamafirewall` - Return LlamaFirewall (PurpleLlama) playbook; ML-based, recommended
- `validate` - Check if bastion config is present
- `status` - Check Bastio API reachability (optional)

## Manual Configuration

### Gateway Configuration

```json
{
  "gateway": {
    "mode": "bastion",
    "bind": "127.0.0.1",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "your-long-random-token-here"
    },
    "bastion": {
      "enabled": true,
      "provider": "bastio",
      "api_url": "https://api.bastio.com/v1",
      "api_key": "${BASTIO_API_KEY}",
      "cache_responses": true,
      "log_inspections": true
    }
  }
}
```

### Environment

```bash
BASTIO_API_KEY=your-bastio-api-key-here
```

## Restart Required

After provisioning, restart the OpenClaw Gateway for changes to take effect.

## References

- [Bastio.ai](https://www.bastio.com)
- [OpenClaw Security](https://docs.clawd.bot/security)
- [Prompt Injection Patterns](https://www.lakera.ai/blog/guide-to-prompt-injection)
